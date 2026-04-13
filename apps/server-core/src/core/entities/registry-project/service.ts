/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RegistryProject } from '@privateaim/core-kit';
import {
    PermissionName,
    isRealmResourceWritable,
} from '@privateaim/kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult } from '../types.ts';
import { AbstractEntityService } from '../service.ts';
import type { IRegistryManager } from '../node/types.ts';
import type { IRegistryProjectRepository, IRegistryProjectService } from './types.ts';
import { RegistryProjectValidator } from './validator.ts';
import { ValidatorGroup } from '../constants.ts';

type RegistryProjectServiceContext = {
    repository: IRegistryProjectRepository;
    registryManager?: IRegistryManager;
};

export class RegistryProjectService extends AbstractEntityService implements IRegistryProjectService {
    protected repository: IRegistryProjectRepository;

    protected registryManager?: IRegistryManager;

    protected validator: RegistryProjectValidator;

    constructor(ctx: RegistryProjectServiceContext) {
        super();
        this.repository = ctx.repository;
        this.registryManager = ctx.registryManager;
        this.validator = new RegistryProjectValidator();
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<RegistryProject>> {
        return this.repository.findMany(query);
    }

    async getOne(id: string, query?: Record<string, any>): Promise<RegistryProject> {
        const entity = query ?
            await this.repository.findMany({ ...query, filter: { id } }).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
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
