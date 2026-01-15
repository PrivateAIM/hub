/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AnalysisNodeLog,
} from '@privateaim/core-kit';

import {
    DBody,
    DController, DDelete, DGet, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    createAnalysisNodeLogRouteHandler,
    deleteAnalysisNodeLogRouteHandler,
    getManyAnalysisNodeLogRouteHandler,
} from './handlers/index.ts';

type PartialAnalysisLog = Partial<AnalysisNodeLog>;

/**
 * /analysis-node/<analysisNodeId>/logs POST
 * /analysis-node/<analysisNodeId>/logs GET
 * /analysis-node/<analysisNodeId>/logs DELETE
 *
 * /analysis-node-logs POST
 * /analysis-node-logs/?filters[analysis_id]=xxx&filters[node_id]=xxx GET
 * /analysis-node-logs/?filters[analysis_id]=xxx&filters[node_id]=xxx DELETE
 */
@DTags('analysis')
@DController('/analysis-node-logs')
export class AnalysisNodeLogController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisLog | undefined> {
        return await getManyAnalysisNodeLogRouteHandler(req, res) as PartialAnalysisLog | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: PartialAnalysisLog,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisLog | undefined> {
        return await createAnalysisNodeLogRouteHandler(req, res) as PartialAnalysisLog | undefined;
    }

    @DDelete('', [ForceLoggedInMiddleware])
    async drop(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisLog | undefined> {
        return await deleteAnalysisNodeLogRouteHandler(req, res) as PartialAnalysisLog | undefined;
    }
}
