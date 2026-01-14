/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AnalysisNodeEvent,
} from '@privateaim/core-kit';

import {
    DController,
    DGet,
    DPath,
    DRequest,
    DResponse,
    DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    getManyAnalysisNodeEventRouteHandler,
    getOneAnalysisNodeEventRouteHandler,
} from './handlers/index.ts';

type PartialEntity = Partial<AnalysisNodeEvent>;

@DTags('analysis')
@DController('/analysis-node-events')
export class AnalysisNodeEventController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialEntity[]> {
        return await getManyAnalysisNodeEventRouteHandler(req, res) as PartialEntity[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialEntity | undefined> {
        return await getOneAnalysisNodeEventRouteHandler(req, res) as PartialEntity | undefined;
    }
}
