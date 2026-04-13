/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucket } from '@privateaim/core-kit';
import {
    DBody,
    DController,
    DDelete,
    DGet,
    DPath,
    DPost,
    DRequest,
    DResponse,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import { send, sendAccepted, sendCreated } from 'routup';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { IAnalysisBucketService } from '../../../../core/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type PartialAnalysisBucket = Partial<AnalysisBucket>;

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
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysisBucket[]> {
        const query = useRequestQuery(req);
        const { data, meta } = await this.service.getMany(query);
        return send(res, { data, meta }) as any;
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysisBucket | undefined> {
        const entity = await this.service.getOne(id);
        return send(res, entity) as PartialAnalysisBucket | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: any,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysisBucket | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.create(data, actor);
        return sendCreated(res, entity) as PartialAnalysisBucket | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
        @DBody() data: any,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysisBucket | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.update(id, data, actor);
        return sendAccepted(res, entity) as PartialAnalysisBucket | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysisBucket | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.delete(id, actor);
        return sendAccepted(res, entity) as PartialAnalysisBucket | undefined;
    }
}
