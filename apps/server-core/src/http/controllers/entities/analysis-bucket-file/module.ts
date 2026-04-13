/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketFile } from '@privateaim/core-kit';
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
import type { IAnalysisBucketFileService } from '../../../../core/index.ts';
import { buildActorContext } from '../../../request/index.ts';

type PartialAnalysisBucketFile = Partial<AnalysisBucketFile>;

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
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysisBucketFile[]> {
        const query = useRequestQuery(req);
        const { data, meta } = await this.service.getMany(query);
        return send(res, { data, meta }) as any;
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysisBucketFile | undefined> {
        const entity = await this.service.getOne(id);
        return send(res, entity) as PartialAnalysisBucketFile | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: any,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysisBucketFile | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.create(data, actor);
        return sendCreated(res, entity) as PartialAnalysisBucketFile | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
        @DBody() data: any,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysisBucketFile | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.update(id, data, actor);
        return sendAccepted(res, entity) as PartialAnalysisBucketFile | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: any,
        @DResponse() res: any,
    ): Promise<PartialAnalysisBucketFile | undefined> {
        const actor = buildActorContext(req);
        const entity = await this.service.delete(id, actor);
        return sendAccepted(res, entity) as PartialAnalysisBucketFile | undefined;
    }
}
