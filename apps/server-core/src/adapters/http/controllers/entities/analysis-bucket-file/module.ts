/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketFile } from '@privateaim/core-kit';
import type {
    AnalysisBucketFileCreatePayload,
    AnalysisBucketFileUpdatePayload,
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
    DStatus,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import type { IAppEvent } from 'routup';
import { ForceLoggedInMiddleware, buildActorContext } from '@privateaim/server-http-kit';
import { RECORD_QUERY_PARAMETERS, describeQuerySchema } from '@privateaim/server-kit';
import type { IAnalysisBucketFileService } from '../../../../../core/index.ts';
import { analysisBucketFileSchema } from '../../../../../core/index.ts';

type AnalysisBucketFileControllerContext = {
    service: IAnalysisBucketFileService;
};

@DTags('analysis', 'node')
@DController('/analysis-bucket-files')
export class AnalysisBucketFileController {
    protected service: IAnalysisBucketFileService;

    constructor(ctx: AnalysisBucketFileControllerContext) {
        this.service = ctx.service;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IAppEvent,
    ): Promise<EntityCollectionResponse<AnalysisBucketFile>> {
        const actor = buildActorContext(event);
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query, actor);

        return { data, meta: { ...meta, schema: describeQuerySchema(analysisBucketFileSchema) } };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<AnalysisBucketFile>> {
        const actor = buildActorContext(event);
        const query = useRequestQuery(event);
        const entity = await this.service.getOne(id, actor, Object.keys(query).length > 0 ? query : undefined);

        return {
            data: entity,
            meta: { schema: describeQuerySchema(analysisBucketFileSchema, RECORD_QUERY_PARAMETERS) },
        };
    }

    @DPost('', [ForceLoggedInMiddleware])
    @DStatus(201)
    async add(
        @DBody() data: AnalysisBucketFileCreatePayload,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<AnalysisBucketFile>> {
        const actor = buildActorContext(event);
        const entity = await this.service.create(data, actor);

        return { data: entity, meta: {} };
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    @DStatus(202)
    async edit(
        @DPath('id') id: string,
        @DBody() data: AnalysisBucketFileUpdatePayload,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<AnalysisBucketFile>> {
        const actor = buildActorContext(event);
        const entity = await this.service.update(id, data, actor);

        return { data: entity, meta: {} };
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    @DStatus(202)
    async drop(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<AnalysisBucketFile>> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);

        return { data: entity, meta: {} };
    }
}
