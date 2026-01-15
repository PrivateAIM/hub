/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AnalysisBucket, AnalysisBucketFile,
} from '@privateaim/core-kit';
import {
    DBody,
    DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    createAnalysisBucketRouteHandler,
    deleteAnalysisBucketRouteHandler,
    getManyAnalysisBucketRouteHandler,
    getOneAnalysisBucketRouteHandler,
    updateAnalysisBucketRouteHandler,
} from './handlers/index.ts';

type PartialAnalysisBucket = Partial<AnalysisBucket>;

@DTags('analysis')
@DController('/analysis-buckets')
export class AnalysisBucketController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisBucket[]> {
        return await getManyAnalysisBucketRouteHandler(req, res) as PartialAnalysisBucket[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisBucket | undefined> {
        return await getOneAnalysisBucketRouteHandler(req, res) as PartialAnalysisBucket | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
            @DBody() data: AnalysisBucketFile,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisBucket | undefined> {
        return await updateAnalysisBucketRouteHandler(req, res) as PartialAnalysisBucket | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: PartialAnalysisBucket,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisBucket | undefined> {
        return await createAnalysisBucketRouteHandler(req, res) as PartialAnalysisBucket | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisBucket | undefined> {
        return await deleteAnalysisBucketRouteHandler(req, res) as PartialAnalysisBucket | undefined;
    }
}
