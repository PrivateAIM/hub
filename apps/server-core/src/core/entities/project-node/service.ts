/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectNode } from '@privateaim/core-kit';
import { NodeType, ProjectNodeApprovalStatus } from '@privateaim/core-kit';
import {
    PermissionName,
    isRealmResourceWritable,
} from '@privateaim/kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import type { ActorContext } from '../actor/types.ts';
import type { EntityRepositoryFindManyResult } from '../types.ts';
import { ValidatorGroup } from '../constants.ts';
import { AbstractEntityService } from '../service.ts';
import type { IProjectRepository } from '../project/types.ts';
import type { IProjectNodeRepository, IProjectNodeService } from './types.ts';
import { ProjectNodeValidator } from './validator.ts';

type ProjectNodeServiceContext = {
    repository: IProjectNodeRepository;
    projectRepository: IProjectRepository;
    skipProjectApproval?: boolean;
};

export class ProjectNodeService extends AbstractEntityService implements IProjectNodeService {
    protected repository: IProjectNodeRepository;

    protected projectRepository: IProjectRepository;

    protected skipProjectApproval: boolean;

    protected validator: ProjectNodeValidator;

    constructor(ctx: ProjectNodeServiceContext) {
        super();
        this.repository = ctx.repository;
        this.projectRepository = ctx.projectRepository;
        this.skipProjectApproval = ctx.skipProjectApproval ?? false;
        this.validator = new ProjectNodeValidator();
    }

    async getMany(query: Record<string, any>): Promise<EntityRepositoryFindManyResult<ProjectNode>> {
        return this.repository.findMany(query);
    }

    async getOne(id: string): Promise<ProjectNode> {
        const entity = await this.repository.findOneById(id);

        if (!entity) {
            throw new NotFoundError();
        }

        return entity;
    }

    async create(data: Partial<ProjectNode>, actor: ActorContext): Promise<ProjectNode> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        await actor.permissionChecker.preCheck({
            name: [
                PermissionName.PROJECT_CREATE,
                PermissionName.PROJECT_UPDATE,
            ],
        });

        await this.repository.validateJoinColumns(validated);

        validated.project_realm_id = validated.project.realm_id;
        validated.node_realm_id = validated.node.realm_id;

        if (!isRealmResourceWritable(actor.realm, validated.project.realm_id)) {
            throw new ForbiddenError('The referenced project realm is not permitted.');
        }

        const entity = this.repository.create(validated);

        if (
            this.skipProjectApproval ||
            (validated.node.type === NodeType.AGGREGATOR)
        ) {
            entity.approval_status = ProjectNodeApprovalStatus.APPROVED;
        }

        await this.repository.save(entity, { data: actor.metadata });

        validated.project.nodes += 1;
        await this.projectRepository.save(validated.project, { data: actor.metadata });

        return entity;
    }

    async update(id: string, data: Partial<ProjectNode>, actor: ActorContext): Promise<ProjectNode> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        await actor.permissionChecker.preCheck({ name: PermissionName.PROJECT_APPROVE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        const isAuthorityOfNode = isRealmResourceWritable(actor.realm, entity.node_realm_id);
        if (!isAuthorityOfNode) {
            throw new ForbiddenError('You are not permitted to update this object.');
        }

        const merged = this.repository.merge(entity, validated);

        return this.repository.save(merged, { data: actor.metadata });
    }

    async delete(id: string, actor: ActorContext): Promise<ProjectNode> {
        await actor.permissionChecker.preCheck({
            name: [
                PermissionName.PROJECT_CREATE,
                PermissionName.PROJECT_UPDATE,
            ],
        });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new NotFoundError();
        }

        if (
            !isRealmResourceWritable(actor.realm, entity.node_realm_id) &&
            !isRealmResourceWritable(actor.realm, entity.project_realm_id)
        ) {
            throw new ForbiddenError('You are not authorized to drop this relation object.');
        }

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        const project = await this.projectRepository.findOneBy({ id: entity.project_id });
        if (project) {
            project.nodes -= 1;
            await this.projectRepository.save(project, { data: actor.metadata });
            entity.project = project;
        }

        return entity;
    }
}
