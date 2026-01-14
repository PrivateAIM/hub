/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AnalysisBucketFile,
} from '@privateaim/core-kit';

import {
    DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    createAnalysisBucketFileRouteHandler,
    deleteAnalysisBucketFileRouteHandler,
    getManyAnalysisBucketFileRouteHandler,
    getOneAnalysisBucketFileRouteHandler,
    updateAnalysisBucketFileRouteHandler,
} from './handlers/index.ts';

type PartialAnalysisBucketFile = Partial<AnalysisBucketFile>;

@DTags('analysis', 'node')
@DController('/analysis-bucket-files')
export class AnalysisBucketFileController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisBucketFile[]> {
        return await getManyAnalysisBucketFileRouteHandler(req, res) as PartialAnalysisBucketFile[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisBucketFile | undefined> {
        return await getOneAnalysisBucketFileRouteHandler(req, res) as PartialAnalysisBucketFile | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
            @DBody() data: AnalysisBucketFile,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisBucketFile | undefined> {
        return await updateAnalysisBucketFileRouteHandler(req, res) as PartialAnalysisBucketFile | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: PartialAnalysisBucketFile,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisBucketFile | undefined> {
        return await createAnalysisBucketFileRouteHandler(req, res) as PartialAnalysisBucketFile | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisBucketFile | undefined> {
        return await deleteAnalysisBucketFileRouteHandler(req, res) as PartialAnalysisBucketFile | undefined;
    }
}
