/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AnalysisNode,
} from '@privateaim/core-kit';

import {
    DBody, DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    createAnalysisNodeRouteHandler,
    deleteAnalysisNodeRouteHandler,
    getManyAnalysisNodeRouteHandler,
    getOneAnalysisNodeRouteHandler,
    updateAnalysisNodeRouteHandler,
} from './handlers/index.ts';

type PartialAnalysisNode = Partial<AnalysisNode>;

@DTags('analysis', 'node')
@DController('/analysis-nodes')
export class AnalysisNodeController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisNode[]> {
        return await getManyAnalysisNodeRouteHandler(req, res) as PartialAnalysisNode[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisNode | undefined> {
        return await getOneAnalysisNodeRouteHandler(req, res) as PartialAnalysisNode | undefined;
    }

    @DPost('/:id', [ForceLoggedInMiddleware])
    async edit(
        @DPath('id') id: string,
            @DBody() data: AnalysisNode,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisNode | undefined> {
        return await updateAnalysisNodeRouteHandler(req, res) as PartialAnalysisNode | undefined;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async add(
        @DBody() data: PartialAnalysisNode,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisNode | undefined> {
        return await createAnalysisNodeRouteHandler(req, res) as PartialAnalysisNode | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisNode | undefined> {
        return await deleteAnalysisNodeRouteHandler(req, res) as PartialAnalysisNode | undefined;
    }
}
