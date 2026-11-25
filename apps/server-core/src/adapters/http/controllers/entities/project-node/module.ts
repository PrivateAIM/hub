/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectNode } from '@privateaim/core-kit';
import type {
    EntityCollectionResponse,
    EntityRecordResponse,
    ProjectNodeCreatePayload,
    ProjectNodeUpdatePayload,
} from '@privateaim/core-http-kit';
import {
    DBody,
    DConsumes,
    DContext,
    DController,
    DDelete,
    DGet,
    DPath,
    DPost,
    DStatus,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import type { IAppEvent } from 'routup';
import { ForceLoggedInMiddleware, buildActorContext } from '@privateaim/server-http-kit';
import { RECORD_QUERY_PARAMETERS, describeQuerySchema } from '@privateaim/server-kit';
import type { IProjectNodeService } from '../../../../../core/index.ts';
import { projectNodeSchema } from '../../../../../core/index.ts';

type ProjectNodeControllerContext = {
    service: IProjectNodeService;
};

@DTags('project-node')
@DController('/project-nodes')
export class ProjectNodeController {
    protected service: IProjectNodeService;

    constructor(ctx: ProjectNodeControllerContext) {
        this.service = ctx.service;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IAppEvent,
    ): Promise<EntityCollectionResponse<ProjectNode>> {
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query);

        return { data, meta: { ...meta, schema: describeQuerySchema(projectNodeSchema) } };
    }

    @DPost('', [ForceLoggedInMiddleware])
    @DConsumes('application/json')
    @DStatus(201)
    async add(
        @DBody() data: ProjectNodeCreatePayload,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<ProjectNode>> {
        const actor = buildActorContext(event);
        const entity = await this.service.create(data, actor);

        return { data: entity, meta: {} };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<ProjectNode>> {
        const query = useRequestQuery(event);
        const entity = await this.service.getOne(id, Object.keys(query).length > 0 ? query : undefined);

        return { data: entity, meta: { schema: describeQuerySchema(projectNodeSchema, RECORD_QUERY_PARAMETERS) } };
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    @DConsumes('application/json')
    @DStatus(202)
    async edit(
        @DPath('id') id: string,
        @DBody() data: ProjectNodeUpdatePayload,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<ProjectNode>> {
        const actor = buildActorContext(event);
        const entity = await this.service.update(id, data, actor);

        return { data: entity, meta: {} };
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    @DStatus(202)
    async drop(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<ProjectNode>> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);

        return { data: entity, meta: {} };
    }
}
