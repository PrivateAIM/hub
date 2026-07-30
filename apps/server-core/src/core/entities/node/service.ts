/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node, RegistryProject } from '@privateaim/core-kit';
import { NodeValidator, RegistryProjectType  } from '@privateaim/core-kit';
import {
    PermissionName,
    ValidatorGroup,
    createNanoID,
    isHex, 
    isRealmResourceWritable, 
} from '@privateaim/kit';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService } from '@privateaim/server-kit';
import { eq } from '@rapiq/core';
import { appendQueryConditions, decodeQuery } from '../../query/index.ts';
import { nodeSchema } from './schema.ts';
import type { INodeRepository, INodeService, IRegistryManager } from './types.ts';

type NodeServiceContext = {
    repository: INodeRepository;
    registryManager?: IRegistryManager;
};

export class NodeService extends AbstractEntityService implements INodeService {
    protected repository: INodeRepository;

    protected registryManager?: IRegistryManager;

    protected validator: NodeValidator;

    constructor(ctx: NodeServiceContext) {
        super();
        this.repository = ctx.repository;
        this.registryManager = ctx.registryManager;
        this.validator = new NodeValidator();
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Node>> {
        return this.repository.findMany(decodeQuery(query, { schema: nodeSchema }));
    }

    async getOne(id: string, query?: Record<string, any>): Promise<Node> {
        const entity = query ?
            await this.repository.findMany(
                appendQueryConditions(
                    decodeQuery(query, { schema: nodeSchema, parameters: ['fields', 'relations'] }),
                    eq('id', id),
                ),
            ).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'node' });
        }

        return entity;
    }

    async create(data: Partial<Node>, actor: ActorContext): Promise<Node> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.NODE_CREATE });

        await this.repository.validateJoinColumns(validated);

        if (validated.realmId) {
            if (!isRealmResourceWritable(actor.realm, validated.realmId)) {
                throw new PermissionDeniedError('You are not permitted to create this node.');
            }
        } else {
            validated.realmId = this.getActorRealmId(actor);
        }

        const entity = this.repository.create(validated);

        if (entity.publicKey && !isHex(entity.publicKey)) {
            entity.publicKey = Buffer
                .from(entity.publicKey, 'utf8')
                .toString('hex');
        }

        await this.linkRegistryProject(entity);

        return this.repository.save(entity, { data: actor.metadata });
    }

    async update(id: string, data: Partial<Node>, actor: ActorContext): Promise<Node> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.NODE_UPDATE });

        await this.repository.validateJoinColumns(validated);

        if (validated.publicKey && !isHex(validated.publicKey)) {
            validated.publicKey = Buffer
                .from(validated.publicKey, 'utf8')
                .toString('hex');
        }

        const entity = await this.repository.findOneWithExternalName(id);
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'node' });
        }

        if (!isRealmResourceWritable(actor.realm, entity.realmId)) {
            throw new PermissionDeniedError('You are not permitted to update this node.');
        }

        const merged = this.repository.merge(entity, validated);

        // Only an explicit `registryId: null` disconnects the node. An update
        // that merely omits the field (a rename, a visibility toggle, …) must
        // never tear down the node's registry project as a side effect.
        const registryCleared = typeof validated.registryId !== 'undefined' &&
            !validated.registryId;

        // Detach + persist before tearing the old project down: the node must
        // never be left referencing a row that is about to disappear.
        const orphaned = await this.syncRegistryProject(merged, registryCleared);

        const saved = await this.repository.save(merged, { data: actor.metadata });

        if (orphaned) {
            await this.registryManager?.removeProject(orphaned);
        }

        return saved;
    }

    async delete(id: string, actor: ActorContext): Promise<Node> {
        await actor.permissionChecker.preCheck({ name: PermissionName.NODE_DELETE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'node' });
        }

        if (!isRealmResourceWritable(actor.realm, entity.realmId)) {
            throw new PermissionDeniedError('You are not permitted to delete this node.');
        }

        await this.unlinkRegistryProject(entity);

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        return entity;
    }

    // ---------------------------------------------------------------

    private async linkRegistryProject(entity: Node): Promise<void> {
        if (!this.registryManager) return;

        let registryId: string | undefined;
        if (entity.registryId) {
            registryId = entity.registryId;
        } else {
            registryId = await this.registryManager.findDefaultRegistryId() ?? undefined;
        }

        if (!registryId) return;

        // Record the assignment, including when it came from the default
        // registry. Leaving `registryId` null while a project exists is an
        // inconsistent state: the node reads as "not connected" everywhere the
        // column is the source of truth, yet owns a provisioned project.
        entity.registryId = registryId;

        const externalName = entity.externalName || createNanoID();
        entity.externalName = externalName;

        const registryProject = await this.registryManager.createProject({
            externalName,
            name: entity.name,
            type: RegistryProjectType.NODE,
            realmId: entity.realmId,
            registryId,
            public: false,
        } as Partial<RegistryProject>);

        entity.registryProjectId = registryProject.id;

        await this.registryManager.linkProject(registryProject.id);
    }

    /**
     * Reconcile the node's registry project with its (possibly just changed)
     * `registryId`.
     *
     * Returns the registry project the node no longer references, if any. The
     * caller must persist the node BEFORE removing it — see the note in
     * {@see update}.
     *
     * @param cleared whether this update explicitly disconnected the node.
     */
    private async syncRegistryProject(
        entity: Node,
        cleared: boolean,
    ): Promise<RegistryProject | undefined> {
        if (!this.registryManager) return undefined;

        if (!entity.registryId) {
            if (!cleared) return undefined;

            // Disconnected — detach the node from its project and hand the
            // project back for teardown. Without this the node keeps a dangling
            // `registryProjectId` and still resolves credentials from a
            // registry it is no longer assigned to.
            const current = entity.registryProjectId ?
                await this.registryManager.findProject(entity.registryProjectId) :
                null;

            entity.registryProjectId = null;

            if (!current) return undefined;

            await this.registryManager.unlinkProject(current);

            return current;
        }

        let registryProject: RegistryProject | undefined;
        if (entity.registryProjectId) {
            registryProject = await this.registryManager.findProject(entity.registryProjectId) ?? undefined;
        }

        const externalName = entity.externalName || createNanoID();

        // A registry project lives inside a single registry, so when the node is
        // re-assigned to a different registry the existing project can no longer
        // serve it. Tear it down and provision a fresh one on the new registry —
        // otherwise the node keeps resolving its credentials (and host) from the
        // old registry.
        let orphaned: RegistryProject | undefined;
        if (registryProject && registryProject.registryId !== entity.registryId) {
            await this.registryManager.unlinkProject(registryProject);
            orphaned = registryProject;
            registryProject = undefined;
        }

        if (registryProject) {
            if (registryProject.externalName !== externalName) {
                registryProject.externalName = externalName;
                registryProject.realmId = entity.realmId;

                await this.registryManager.saveProject(registryProject);
                await this.registryManager.relinkProject(registryProject);
            }
        } else {
            registryProject = await this.registryManager.createProject({
                externalName,
                name: entity.name,
                type: RegistryProjectType.NODE,
                realmId: entity.realmId,
                registryId: entity.registryId,
                public: false,
            } as Partial<RegistryProject>);

            await this.registryManager.linkProject(registryProject.id);
        }

        entity.registryProjectId = registryProject.id;
        entity.externalName = externalName;

        return orphaned;
    }

    private async unlinkRegistryProject(entity: Node): Promise<void> {
        if (!this.registryManager || !entity.registryProjectId) return;

        const registryProject = await this.registryManager.findProject(entity.registryProjectId);
        if (!registryProject) return;

        await this.registryManager.unlinkProject(registryProject);
        await this.registryManager.removeProject(registryProject);
    }
}
