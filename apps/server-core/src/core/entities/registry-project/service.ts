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
    isRealmResourceWritable, 
} from '@privateaim/kit';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult, IEntityRepository } from '@privateaim/server-kit';
import { AbstractEntityService } from '@privateaim/server-kit';
import { eq } from '@rapiq/core';
import { appendQueryConditions, decodeQuery } from '../../query/index.ts';
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
        const result = await this.repository.findMany(decodeQuery(query, { schema: registryProjectSchema }));

        if (result.data.some((e) => this.hasSecretField(e))) {
            await this.checkSecretFieldAccess(result.data, actor);
        }

        return result;
    }

    async getOne(id: string, actor: ActorContext, query?: Record<string, any>): Promise<RegistryProject> {
        const entity = query ?
            await this.repository.findMany(appendQueryConditions(decodeQuery(query, { schema: registryProjectSchema, parameters: ['fields', 'relations'] }), eq('id', id))).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'registry-project' });
        }

        if (this.hasSecretField(entity)) {
            await this.checkSecretFieldAccess([entity], actor);
        }

        return entity;
    }

    private hasSecretField(entity: RegistryProject): boolean {
        return isPropertySet(entity, SECRET_FIELD) &&
            !!entity.accountSecret;
    }

    private async checkSecretFieldAccess(entities: RegistryProject[], actor: ActorContext): Promise<void> {
        try {
            await actor.permissionChecker.preCheck({ name: PermissionName.REGISTRY_MANAGE });
            return;
        } catch {
            // permission not granted — check node-client condition
        }

        if (
            actor.identity &&
            actor.identity.type === 'client' &&
            this.nodeRepository
        ) {
            const node = await this.nodeRepository.findOneBy({ clientId: actor.identity.id });
            if (node && node.registryProjectId) {
                const requestedIds = new Set(entities.map((e) => e.id));
                if (requestedIds.size === 1 && requestedIds.has(node.registryProjectId)) {
                    return;
                }
            }
        }

        throw new PermissionDeniedError();
    }

    async create(data: Partial<RegistryProject>, actor: ActorContext): Promise<RegistryProject> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.REGISTRY_PROJECT_MANAGE });

        await this.repository.validateJoinColumns(validated);

        const entity = this.repository.create(validated);

        const saved = await this.repository.save(entity, { data: actor.metadata });

        if (this.registryManager) {
            await this.registryManager.linkProject(saved.id);
        }

        return saved;
    }

    async update(id: string, data: Partial<RegistryProject>, actor: ActorContext): Promise<RegistryProject> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.REGISTRY_PROJECT_MANAGE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'registry-project' });
        }

        if (!isRealmResourceWritable(actor.realm, entity.realmId)) {
            throw new PermissionDeniedError();
        }

        const previousExternalName = entity.externalName;

        const merged = this.repository.merge(entity, validated);

        const saved = await this.repository.save(merged, { data: actor.metadata });

        if (this.registryManager) {
            if (
                previousExternalName &&
                validated.externalName &&
                previousExternalName !== validated.externalName
            ) {
                await this.registryManager.unlinkProject(saved);
                await this.registryManager.linkProject(saved.id);
            } else {
                await this.registryManager.linkProject(saved.id);
            }
        }

        return saved;
    }

    async delete(id: string, actor: ActorContext): Promise<RegistryProject> {
        await actor.permissionChecker.preCheck({ name: PermissionName.REGISTRY_PROJECT_MANAGE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'registry-project' });
        }

        if (!isRealmResourceWritable(actor.realm, entity.realmId)) {
            throw new PermissionDeniedError();
        }

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        if (this.registryManager) {
            await this.registryManager.unlinkProject(entity);
        }

        return entity;
    }
}
