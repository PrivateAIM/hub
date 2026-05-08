/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucket } from '@privateaim/core-kit';
import type { AnalysisBucketCreatePayload } from '@privateaim/core-http-kit';
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
import type { IRoutupEvent } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { IAnalysisBucketService } from '../../../../../core/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type AnalysisBucketControllerContext = {
    service: IAnalysisBucketService;
};

@DTags('analysis')
@DController('/analysis-buckets')
export class AnalysisBucketController {
    protected service: IAnalysisBucketService;

    constructor(ctx: AnalysisBucketControllerContext) {
        this.service = ctx.service;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IRoutupEvent,
    ) {
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query);
        return { data, meta };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
    ): Promise<AnalysisBucket> {
        return this.service.getOne(id);
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: AnalysisBucketCreatePayload,
        @DContext() event: IRoutupEvent,
    ): Promise<AnalysisBucket> {
        const actor = buildActorContext(event);
        const entity = await this.service.create(data, actor);
        event.response.status = 201;
        return entity;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
        @DBody() data: Partial<AnalysisBucketCreatePayload>,
        @DContext() event: IRoutupEvent,
    ): Promise<AnalysisBucket> {
        const actor = buildActorContext(event);
        const entity = await this.service.update(id, data, actor);
        event.response.status = 202;
        return entity;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DContext() event: IRoutupEvent,
    ): Promise<AnalysisBucket> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);
        event.response.status = 202;
        return entity;
    }
}
