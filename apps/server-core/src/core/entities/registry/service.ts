/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Registry } from '@privateaim/core-kit';
import { PermissionName, getHostNameFromString } from '@privateaim/kit';
import { NotFoundError } from '@ebec/http';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult } from '../types.ts';
import { AbstractEntityService } from '../service.ts';
import type { IRegistryRepository, IRegistryService } from './types.ts';
import { RegistryValidator } from './validator.ts';
import { ValidatorGroup } from '../constants.ts';

type RegistryServiceContext = {
    repository: IRegistryRepository;
};

export class RegistryService extends AbstractEntityService implements IRegistryService {
    protected repository: IRegistryRepository;

    protected validator: RegistryValidator;

    constructor(ctx: RegistryServiceContext) {
        super();
        this.repository = ctx.repository;
        this.validator = new RegistryValidator();
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Registry>> {
        return this.repository.findMany(query);
    }

    async getOne(id: string, query?: Record<string, any>): Promise<Registry> {
        const entity = query ?
            await this.repository.findMany({ ...query, filter: { id } }).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    async create(data: Partial<Registry>, actor: ActorContext): Promise<Registry> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.REGISTRY_MANAGE });

        if (validated.host) {
            validated.host = getHostNameFromString(validated.host);
        }

        const entity = this.repository.create(validated);

        return this.repository.save(entity, { data: actor.metadata });
    }

    async update(id: string, data: Partial<Registry>, actor: ActorContext): Promise<Registry> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.REGISTRY_MANAGE });

        if (validated.host) {
            validated.host = getHostNameFromString(validated.host);
        }

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        const merged = this.repository.merge(entity, validated);

        return this.repository.save(merged, { data: actor.metadata });
    }

    async delete(id: string, actor: ActorContext): Promise<Registry> {
        await actor.permissionChecker.preCheck({ name: PermissionName.REGISTRY_MANAGE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        return entity;
    }
}
