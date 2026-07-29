/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis, AnalysisCommand } from '@privateaim/core-kit';
import type {
    AnalysisCreatePayload,
    AnalysisUpdatePayload,
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
import type { IAnalysisService } from '../../../../../core/index.ts';
import { analysisSchema } from '../../../../../core/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type AnalysisControllerContext = {
    service: IAnalysisService;
};

@DTags('analysis')
@DController('/analyses')
export class AnalysisController {
    protected service: IAnalysisService;

    constructor(ctx: AnalysisControllerContext) {
        this.service = ctx.service;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IAppEvent,
    ): Promise<EntityCollectionResponse<Analysis>> {
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query);
        return { data, meta: { ...meta, schema: describeQuerySchema(analysisSchema) } };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
    ): Promise<EntityRecordResponse<Analysis>> {
        const entity = await this.service.getOne(id);

        return { data: entity, meta: { schema: describeQuerySchema(analysisSchema, RECORD_QUERY_PARAMETERS) } };
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: AnalysisCreatePayload,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Analysis>> {
        const actor = buildActorContext(event);
        const entity = await this.service.create(data, actor);
        event.response.status = 201;
        return { data: entity, meta: {} };
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
        @DBody() data: AnalysisUpdatePayload,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Analysis>> {
        const actor = buildActorContext(event);
        const entity = await this.service.update(id, data, actor);
        event.response.status = 202;
        return { data: entity, meta: {} };
    }

    @DPost('/:id/command', [ForceLoggedInMiddleware])
    async doTask(
        @DPath('id') id: string,
        @DBody() data: { command: AnalysisCommand },
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Analysis>> {
        const actor = buildActorContext(event);
        const entity = await this.service.executeCommand(id, data.command, actor);
        event.response.status = 202;
        return { data: entity, meta: {} };
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Analysis>> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);
        event.response.status = 202;
        return { data: entity, meta: {} };
    }
}
