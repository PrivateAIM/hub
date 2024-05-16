/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AnalysisFile,
} from '@privateaim/core';

import {
    DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    createAnalysisFileRouteHandler,
    deleteAnalysisFileRouteHandler,
    getManyAnalysisFileRouteHandler,
    getOneAnalysisFileRouteHandler,
    updateAnalysisFileRouteHandler,
} from './handlers';

type PartialAnalysisFile = Partial<AnalysisFile>;

@DTags('analysis', 'node')
@DController('/analysis-files')
export class AnalysisFileController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisFile[]> {
        return await getManyAnalysisFileRouteHandler(req, res) as PartialAnalysisFile[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisFile | undefined> {
        return await getOneAnalysisFileRouteHandler(req, res) as PartialAnalysisFile | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
            @DBody() data: AnalysisFile,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisFile | undefined> {
        return await updateAnalysisFileRouteHandler(req, res) as PartialAnalysisFile | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: PartialAnalysisFile,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisFile | undefined> {
        return await createAnalysisFileRouteHandler(req, res) as PartialAnalysisFile | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisFile | undefined> {
        return await deleteAnalysisFileRouteHandler(req, res) as PartialAnalysisFile | undefined;
    }
}
