/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AnalysisNode,
    AnalysisNodeLog,
} from '@privateaim/core-kit';

import {
    DBody,
    DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    createAnalysisNodeLogRouteHandler,
    deleteAnalysisNodeLogRouteHandler,
    getManyAnalysisLogRouteHandler,
    getOneAnalysisNodeLogRouteHandler,
    updateAnalysisNodeLogRouteHandler,
} from './handlers';

type PartialAnalysisLog = Partial<AnalysisNodeLog>;

@DTags('analysis')
@DController('/analysis-node-logs')
export class AnalysisNodeLogController {
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
        return await getOneAnalysisNodeLogRouteHandler(req, res) as PartialAnalysisLog | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
            @DBody() data: AnalysisNode,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisLog | undefined> {
        return await updateAnalysisNodeLogRouteHandler(req, res) as PartialAnalysisLog | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: PartialAnalysisLog,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisLog | undefined> {
        return await createAnalysisNodeLogRouteHandler(req, res) as PartialAnalysisLog | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisLog | undefined> {
        return await deleteAnalysisNodeLogRouteHandler(req, res) as PartialAnalysisLog | undefined;
    }
}
