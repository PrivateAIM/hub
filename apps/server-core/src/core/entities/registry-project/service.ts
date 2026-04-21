/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node, RegistryProject } from '@privateaim/core-kit';
import {
    PermissionName,
    isPropertySet,
    isRealmResourceWritable,
} from '@privateaim/kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult, IEntityRepository } from '../types.ts';
import { AbstractEntityService } from '../service.ts';
import type { IRegistryManager } from '../node/types.ts';
import type { IRegistryProjectRepository, IRegistryProjectService } from './types.ts';
import { RegistryProjectValidator } from './validator.ts';
import { ValidatorGroup } from '../constants.ts';

type RegistryProjectServiceContext = {
    repository: IRegistryProjectRepository;
    registryManager?: IRegistryManager;
    nodeRepository?: IEntityRepository<Node>;
};

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
        const result = await this.repository.findMany(query);

        if (result.data.some((e) => this.hasSecretField(e))) {
            await this.checkSecretFieldAccess(result.data, actor);
        }

        return result;
    }

    async getOne(id: string, actor: ActorContext, query?: Record<string, any>): Promise<RegistryProject> {
        const entity = query ?
            await this.repository.findMany({ ...query, filter: { id } }).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        if (this.hasSecretField(entity)) {
            await this.checkSecretFieldAccess([entity], actor);
        }

        return entity;
    }

    private hasSecretField(entity: RegistryProject): boolean {
        return isPropertySet(entity, 'account_secret') &&
            !!entity.account_secret;
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
            const node = await this.nodeRepository.findOneBy({ client_id: actor.identity.id });
            if (node && node.registry_project_id) {
                const requestedIds = new Set(entities.map((e) => e.id));
                if (requestedIds.size === 1 && requestedIds.has(node.registry_project_id)) {
                    return;
                }
            }
        }

        throw new ForbiddenError();
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
            throw new NotFoundError();
        }

        if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
            throw new ForbiddenError();
        }

        const previousExternalName = entity.external_name;

        const merged = this.repository.merge(entity, validated);

        const saved = await this.repository.save(merged, { data: actor.metadata });

        if (this.registryManager) {
            if (
                previousExternalName &&
                validated.external_name &&
                previousExternalName !== validated.external_name
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
            throw new NotFoundError();
        }

        if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
            throw new ForbiddenError();
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
