/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node, RegistryProject } from '@privateaim/core-kit';
import {
    PermissionName,
    ValidatorGroup,
    isPropertySet,
} from '@privateaim/kit';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';
import {
    AbstractEntityService,
    appendQueryConditions,
    scopeReadQuery,
} from '@privateaim/server-kit';
import {
    evaluateRecord, 
    evaluateRecordUpdate, 
    isPermissionError, 
    reachesRecord,
} from '@authup/access';
import type { IQuery } from '@rapiq/core';
import { eq } from '@rapiq/core';
import { decodeQuery, preEvaluateRelationReads } from '../../query/index.ts';
import { REGISTRY_READ_PERMISSIONS } from '../registry/service.ts';
import type { IRegistryManager } from '../node/types.ts';
import type { IRegistryProjectRepository, IRegistryProjectService } from './types.ts';
import { registryProjectSchema } from './schema.ts';
import { RegistryProjectValidator } from '@privateaim/core-kit';

type RegistryProjectServiceContext = {
    repository: IRegistryProjectRepository;
    registryManager?: IRegistryManager;
    nodeRepository?: IEntityRepository<Node>;
};

/**
 * The permission-gated field, as a checked literal — see the twin in
 * core/entities/registry/service.ts. A stale string makes `hasSecretField()`
 * return false and skips the REGISTRY_MANAGE gate instead of failing.
 */
const SECRET_FIELD = 'accountSecret' satisfies keyof RegistryProject;

/**
 * Unlike the global catalogs, registry project reads are narrowed to the
 * reach of the caller's grant. REGISTRY_MANAGE reads too, because it already
 * governs the secret column, the credentials route and the registry admin UI.
 */
export const REGISTRY_PROJECT_READ_PERMISSIONS = [
    PermissionName.REGISTRY_PROJECT_READ,
    PermissionName.REGISTRY_PROJECT_MANAGE,
    PermissionName.REGISTRY_MANAGE,
];

/** Relations an `include` can join, each guarded by its own read grant. */
const RELATION_READ_PERMISSIONS = { registry: REGISTRY_READ_PERMISSIONS } satisfies Partial<Record<keyof RegistryProject, string[]>>;

export class RegistryProjectService extends AbstractEntityService implements IRegistryProjectService {
    protected repository: IRegistryProjectRepository;

    protected registryManager?: IRegistryManager;

    protected nodeRepository?: IEntityRepository<Node>;

    protected validator: RegistryProjectValidator;

    constructor(ctx: RegistryProjectServiceContext) {
        super();
        this.repository = ctx.repository;
        this.registryManager = ctx.registryManager;
        this.nodeRepository = ctx.nodeRepository;
        this.validator = new RegistryProjectValidator();
    }

    async getMany(query: Record<string, any>, actor: ActorContext): Promise<EntityRepositoryFindManyResult<RegistryProject>> {
        const scoped = await this.scopeRead(decodeQuery(query, { schema: registryProjectSchema }), actor);
        const result = await this.repository.findMany(scoped);

        if (result.data.some((e) => this.hasSecretField(e))) {
            await this.checkSecretFieldAccess(result.data, actor);
        }

        return result;
    }

    async getOne(id: string, actor: ActorContext, query?: Record<string, any>): Promise<RegistryProject> {
        const scoped = await this.scopeRead(
            decodeQuery(query, { schema: registryProjectSchema, parameters: ['fields', 'relations'] }),
            actor,
        );

        const { data: [entity] } = await this.repository.findMany(appendQueryConditions(scoped, eq('id', id)));
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'registry-project' });
        }

        if (this.hasSecretField(entity)) {
            await this.checkSecretFieldAccess([entity], actor);
        }

        return entity;
    }

    /**
     * Shared by list and record reads: check the read grant and narrow the
     * query to its reach. A node's own client without that grant may still
     * read exactly its own project; if it does hold the grant, the grant wins.
     */
    private async scopeRead(query: IQuery, actor: ActorContext): Promise<IQuery> {
        await preEvaluateRelationReads(query, actor, RELATION_READ_PERMISSIONS);

        try {
            return await scopeReadQuery(query, actor, { names: REGISTRY_PROJECT_READ_PERMISSIONS });
        } catch (e) {
            if (!isPermissionError(e)) {
                throw e;
            }

            const ownProjectId = await this.findOwnNodeProjectId(actor);
            if (!ownProjectId) {
                throw e;
            }

            return appendQueryConditions(query, eq('id', ownProjectId));
        }
    }

    /**
     * The registry project of the node whose client is calling, if any. Bound
     * in the client's own realm only: `node.clientId` is writable by node
     * managers and not unique, so another realm must not claim a client.
     */
    private async findOwnNodeProjectId(actor: ActorContext): Promise<string | undefined> {
        if (!actor.identity || actor.identity.type !== 'client' || !actor.identity.realmId || !this.nodeRepository) {
            return undefined;
        }

        const node = await this.nodeRepository.findOneBy({ clientId: actor.identity.id, realmId: actor.identity.realmId });
        return node?.registryProjectId ?? undefined;
    }

    private hasSecretField(entity: RegistryProject): boolean {
        return isPropertySet(entity, SECRET_FIELD) &&
            !!entity.accountSecret;
    }

    private async checkSecretFieldAccess(entities: RegistryProject[], actor: ActorContext): Promise<void> {
        if (await this.holdsRegistryManage(entities, actor)) {
            return;
        }

        // Without REGISTRY_MANAGE, a node's client may only see its own project's secret.
        const ids = new Set(entities.map((e) => e.id));
        if (ids.size === 1 && ids.has(await this.findOwnNodeProjectId(actor))) {
            return;
        }

        throw new PermissionDeniedError();
    }

    /**
     * Whether a REGISTRY_MANAGE grant reaches every secret-bearing project, by
     * its realm and against the row — not just whether one is held, or an
     * `own` grant would reveal the secrets of every realm the caller can read.
     * Only a permission denial reads as "not held"; any other failure propagates.
     */
    private async holdsRegistryManage(entities: RegistryProject[], actor: ActorContext): Promise<boolean> {
        for (const entity of entities) {
            if (!this.hasSecretField(entity)) {
                continue;
            }

            // A sparse fieldset (`?fields=id,accountSecret`) may not load the
            // realm, and an undefined record realm is refused outright.
            const realmId = typeof entity.realmId === 'undefined' ?
                (await this.repository.findOneById(entity.id))?.realmId :
                entity.realmId;
            if (typeof realmId === 'undefined') {
                return false;
            }

            const reached = await reachesRecord(actor.permissionEvaluator, {
                name: PermissionName.REGISTRY_MANAGE,
                realm: realmId,
                data: { attributes: { ...entity, realmId } },
            });
            if (!reached) {
                return false;
            }
        }

        return true;
    }

    async create(data: Partial<RegistryProject>, actor: ActorContext): Promise<RegistryProject> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.REGISTRY_PROJECT_MANAGE });

        await this.repository.validateJoinColumns(validated);

        const entity = this.repository.create(validated);

        // A project created here carries no realm (the validator mounts none):
        // a global row, which only `ownOrNull`/`any` grants reach.
        await evaluateRecord(actor.permissionEvaluator, {
            name: PermissionName.REGISTRY_PROJECT_MANAGE,
            realm: entity.realmId ?? null,
            data: { attributes: entity },
        });

        const saved = await this.repository.save(entity, { data: actor.metadata });

        if (this.registryManager) {
            await this.registryManager.linkProject(saved.id);
        }

        return saved;
    }

    async update(id: string, data: Partial<RegistryProject>, actor: ActorContext): Promise<RegistryProject> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.REGISTRY_PROJECT_MANAGE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'registry-project' });
        }

        const previousExternalName = entity.externalName;

        // Snapshot the stored row: typeorm's merge() writes into `entity`.
        const current = { realm: entity.realmId, data: { attributes: { ...entity } } };
        const merged = this.repository.merge(entity, validated);
        await evaluateRecordUpdate(actor.permissionEvaluator, {
            name: PermissionName.REGISTRY_PROJECT_MANAGE,
            current,
            next: { realm: merged.realmId, data: { attributes: merged } },
        });

        const saved = await this.repository.save(merged, { data: actor.metadata });

        if (this.registryManager) {
            if (
                previousExternalName &&
                validated.externalName &&
                previousExternalName !== validated.externalName
            ) {
                // one command: separate unlink + link messages could run out of order.
                await this.registryManager.relinkProject({ ...saved, externalName: previousExternalName });
            } else {
                await this.registryManager.linkProject(saved.id);
            }
        }

        return saved;
    }

    async delete(id: string, actor: ActorContext): Promise<RegistryProject> {
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.REGISTRY_PROJECT_MANAGE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'registry-project' });
        }

        await evaluateRecord(actor.permissionEvaluator, {
            name: PermissionName.REGISTRY_PROJECT_MANAGE,
            realm: entity.realmId,
            data: { attributes: entity },
        });

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        if (this.registryManager) {
            await this.registryManager.unlinkProject(entity);
        }

        return entity;
    }
}
