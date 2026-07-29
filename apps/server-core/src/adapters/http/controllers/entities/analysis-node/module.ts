/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNode } from '@privateaim/core-kit';
import type {
    AnalysisNodeCreatePayload,
    AnalysisNodeUpdatePayload,
    EntityCollectionResponse,
    EntityRecordResponse,
} from '@privateaim/core-http-kit';
import {
    DBody,
    DContext,
    DController,
    DDelete,
    DGet,
    DPath,
    DPost,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import type { IAppEvent } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import { RECORD_QUERY_PARAMETERS, describeQuerySchema } from '@privateaim/server-kit';
import type { IAnalysisNodeService } from '../../../../../core/index.ts';
import { analysisNodeSchema } from '../../../../../core/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type AnalysisNodeControllerContext = {
    service: IAnalysisNodeService;
};

@DTags('analysis-node')
@DController('/analysis-nodes')
export class AnalysisNodeController {
    protected service: IAnalysisNodeService;

    constructor(ctx: AnalysisNodeControllerContext) {
        this.service = ctx.service;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IAppEvent,
    ): Promise<EntityCollectionResponse<AnalysisNode>> {
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query);
        return { data, meta: { ...meta, schema: describeQuerySchema(analysisNodeSchema) } };
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: AnalysisNodeCreatePayload,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<AnalysisNode>> {
        const actor = buildActorContext(event);
        const entity = await this.service.create(data, actor);
        event.response.status = 201;
        return { data: entity, meta: {} };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
    ): Promise<EntityRecordResponse<AnalysisNode>> {
        const entity = await this.service.getOne(id);

        return { data: entity, meta: { schema: describeQuerySchema(analysisNodeSchema, RECORD_QUERY_PARAMETERS) } };
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
        @DBody() data: AnalysisNodeUpdatePayload,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<AnalysisNode>> {
        const actor = buildActorContext(event);
        const entity = await this.service.update(id, data, actor);
        event.response.status = 202;
        return { data: entity, meta: {} };
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<AnalysisNode>> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);
        event.response.status = 202;
        return { data: entity, meta: {} };
    }
}
