/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { eq } from '@rapiq/core';
import type { ProjectNode } from '@privateaim/core-kit';
import { NodeType, ProjectNodeApprovalStatus, ProjectNodeValidator  } from '@privateaim/core-kit';
import { PermissionName, ValidatorGroup } from '@privateaim/kit';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { ActorContext, EntityRepositoryFindManyResult } from '@privateaim/server-kit';
import { AbstractEntityService, appendQueryConditions } from '@privateaim/server-kit';
import { evaluateRecord, evaluateRecordUpdate, reachesRecord } from '@authup/access';
import { decodeQuery } from '../../query/index.ts';
import type { IProjectRepository } from '../project/types.ts';
import { projectNodeSchema } from './schema.ts';
import type { IProjectNodeRepository, IProjectNodeService } from './types.ts';

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
        return this.repository.findMany(decodeQuery(query, { schema: projectNodeSchema }));
    }

    /**
     * `findOneById` takes no query, so an actor-supplied `fields`/`relations`
     * selection has to go through `findMany` with an `id` condition appended.
     */
    async getOne(id: string, query?: Record<string, any>): Promise<ProjectNode> {
        const entity = query ?
            await this.repository.findMany(appendQueryConditions(decodeQuery(query, { schema: projectNodeSchema, parameters: ['fields', 'relations'] }), eq('id', id))).then((r) => r.data[0]) :
            await this.repository.findOneById(id);

        if (!entity) {
            throw new EntityNotFoundError({ entity: 'project-node' });
        }

        return entity;
    }

    async create(data: Partial<ProjectNode>, actor: ActorContext): Promise<ProjectNode> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.CREATE });

        // Attaching a node changes the project's composition — an update,
        // the same rule `delete` applies. PROJECT_CREATE alone is not enough.
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.PROJECT_UPDATE });

        await this.repository.validateJoinColumns(validated);

        validated.projectRealmId = validated.project.realmId;
        validated.nodeRealmId = validated.node.realmId;

        await evaluateRecord(actor.permissionEvaluator, {
            name: PermissionName.PROJECT_UPDATE,
            realm: validated.projectRealmId,
            data: { attributes: validated },
        });

        const entity = this.repository.create(validated);

        if (
            this.skipProjectApproval ||
            (validated.node.type === NodeType.AGGREGATOR)
        ) {
            entity.approvalStatus = ProjectNodeApprovalStatus.APPROVED;
        }

        await this.repository.save(entity, { data: actor.metadata });

        validated.project.nodes += 1;
        await this.projectRepository.save(validated.project, { data: actor.metadata });

        return entity;
    }

    async update(id: string, data: Partial<ProjectNode>, actor: ActorContext): Promise<ProjectNode> {
        const validated = await this.validator.run(data, { group: ValidatorGroup.UPDATE });

        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.PROJECT_APPROVE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'project-node' });
        }

        // Approval is the node's decision: the grant must reach the node's realm.
        // The stored row is snapshotted, since typeorm's merge() writes into `entity`.
        const current = { realm: entity.nodeRealmId, data: { attributes: { ...entity } } };
        const merged = this.repository.merge(entity, validated);
        await evaluateRecordUpdate(actor.permissionEvaluator, {
            name: PermissionName.PROJECT_APPROVE,
            current,
            next: { realm: merged.nodeRealmId, data: { attributes: merged } },
        });

        return this.repository.save(merged, { data: actor.metadata });
    }

    async delete(id: string, actor: ActorContext): Promise<ProjectNode> {
        // Removing a node from a project changes an EXISTING project, which is
        // an update; PROJECT_CREATE alone must not suffice.
        await actor.permissionEvaluator.preEvaluate({ name: PermissionName.PROJECT_UPDATE });

        const entity = await this.repository.findOneBy({ id });
        if (!entity) {
            throw new EntityNotFoundError({ entity: 'project-node' });
        }

        // Either side may detach: the project's realm or the node's. Two
        // checks, since authup reads several realms as "all of", not "any of".
        if (
            !await reachesRecord(actor.permissionEvaluator, {
                name: PermissionName.PROJECT_UPDATE,
                realm: entity.projectRealmId,
                data: { attributes: entity },
            }) &&
            !await reachesRecord(actor.permissionEvaluator, {
                name: PermissionName.PROJECT_UPDATE,
                realm: entity.nodeRealmId,
                data: { attributes: entity },
            })
        ) {
            throw new PermissionDeniedError('You are not authorized to drop this relation object.');
        }

        const entityId = entity.id;

        await this.repository.remove(entity, { data: actor.metadata });

        entity.id = entityId;

        const project = await this.projectRepository.findOneBy({ id: entity.projectId });
        if (project) {
            project.nodes -= 1;
            await this.projectRepository.save(project, { data: actor.metadata });
            entity.project = project;
        }

        return entity;
    }
}
