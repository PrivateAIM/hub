/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    AnalysisLog,
} from '@privateaim/core';

import {
    DController, DDelete, DGet, DPath, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '../../../middleware';
import {
    deleteAnalysisLogRouteHandler,
    getManyAnalysisLogRouteHandler,
    getOneAnalysisLogRouteHandler,
} from './handlers';

type PartialAnalysisLog = Partial<AnalysisLog>;

@DTags('analysis')
@DController('/analysis-logs')
export class AnalysisLogController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisLog[]> {
        return await getManyAnalysisLogRouteHandler(req, res) as PartialAnalysisLog[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisLog | undefined> {
        return await getOneAnalysisLogRouteHandler(req, res) as PartialAnalysisLog | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisLog | undefined> {
        return await deleteAnalysisLogRouteHandler(req, res) as PartialAnalysisLog | undefined;
    }
}
