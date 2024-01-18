/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    AnalysisFile,
} from '@personalhealthtrain/core';
import {
    DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';

import {
    deleteAnalysisFileRouteHandler,
    getManyAnalysisFileGetManyRouteHandler,
    getOneAnalysisFileRouteHandler,
    uploadAnalysisFilesRouteHandler,
} from './handlers';
import { ForceLoggedInMiddleware } from '../../../middleware';

type PartialAnalysisFile = Partial<AnalysisFile>;

@DTags('analysis')
@DController('/analysis-files')
export class AnalysisFileController {
    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisFile | undefined> {
        return await getOneAnalysisFileRouteHandler(req, res) as PartialAnalysisFile | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisFile | undefined> {
        return await deleteAnalysisFileRouteHandler(req, res) as PartialAnalysisFile | undefined;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisFile[]> {
        return await getManyAnalysisFileGetManyRouteHandler(req, res) as PartialAnalysisFile[];
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<any> {
        return await uploadAnalysisFilesRouteHandler(req, res) as any;
    }
}
