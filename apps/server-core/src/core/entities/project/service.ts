/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Project } from '@privateaim/core-kit';
import {
    PermissionName,
    isRealmResourceWritable,
} from '@privateaim/kit';
import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService, ValidatorGroup } from '@privateaim/server-kit';
import type { IProjectRepository, IProjectService } from './types.ts';
import { ProjectValidator } from './validator.ts';

type ProjectServiceContext = {
    repository: IProjectRepository;
};

export class ProjectService extends AbstractEntityService implements IProjectService {
    protected repository: IProjectRepository;

    protected validator: ProjectValidator;

    constructor(ctx: ProjectServiceContext) {
        super();
        this.repository = ctx.repository;
        this.validator = new ProjectValidator();
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<Project>> {
        return this.repository.findMany(query);
    }

    async getOne(id: string, query?: Record<string, any>): Promise<Project> {
        const entity = query ?
            await this.repository.findMany({ ...query, filter: { id } }).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    async create(data: Partial<Project>, actor: ActorContext): Promise<Project> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.PROJECT_CREATE });

        await this.repository.validateJoinColumns(validated);

        if (validated.realm_id) {
            if (!isRealmResourceWritable(actor.realm, validated.realm_id)) {
                throw new ForbiddenError('You are not permitted to create this project.');
            }
        } else {
            validated.realm_id = this.getActorRealmId(actor);
        }

        if (actor.identity) {
            switch (actor.identity.type) {
                case 'user': {
                    validated.user_id = actor.identity.id;
                    break;
                }
                case 'robot': {
                    validated.robot_id = actor.identity.id;
                    break;
                }
                case 'client': {
                    validated.client_id = actor.identity.id;
                    break;
                }
                default: {
                    throw new BadRequestError('Only client-, user- or robot-accounts are permitted to create a project');
                }
            }
        } else {
            throw new BadRequestError('Only client-, user- or robot-accounts are permitted to create a project');
        }

        const entity = this.repository.create(validated);

        await this.repository.checkUniqueness(entity);

        return this.repository.save(entity, { data: actor.metadata });
    }

    async update(id: string, data: Partial<Project>, actor: ActorContext): Promise<Project> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.PROJECT_UPDATE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
            throw new ForbiddenError();
        }

        const merged = this.repository.merge(entity, validated);

        await this.repository.checkUniqueness(merged, entity);

        return this.repository.save(merged, { data: actor.metadata });
    }

    async delete(id: string, actor: ActorContext): Promise<Project> {
        await actor.permissionChecker.preCheck({ name: PermissionName.PROJECT_DELETE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        if (!isRealmResourceWritable(actor.realm, entity.realm_id)) {
            throw new ForbiddenError();
        }

        if (entity.analyses > 0) {
            throw new BadRequestError('The project still has associated analyses.');
        }

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        return entity;
    }
}
