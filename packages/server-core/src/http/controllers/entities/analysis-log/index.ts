/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    AnalysisLog,
} from '@privateaim/core-kit';

import {
    DController, DDelete, DGet, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    deleteAnalysisLogRouteHandler,
    getManyAnalysisLogRouteHandler,
} from './handlers/index.ts';

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

    @DDelete('', [ForceLoggedInMiddleware])
    async drop(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisLog | undefined> {
        return await deleteAnalysisLogRouteHandler(req, res) as PartialAnalysisLog | undefined;
    }
}
