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
    DController, DDelete, DGet, DPath, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    deleteMasterImageEventRouteHandler,
    getManyMasterImageEventLogRouteHandler,
    getOneMasterImageEventLogRouteHandler,
} from './handlers';

type PartialAnalysisLog = Partial<AnalysisLog>;

@DTags('masterImage')
@DController('/master-image-events')
export class MasterImageEventLogController {
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisLog[]> {
        return await getManyMasterImageEventLogRouteHandler(req, res) as PartialAnalysisLog[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisLog | undefined> {
        return await getOneMasterImageEventLogRouteHandler(req, res) as PartialAnalysisLog | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialAnalysisLog | undefined> {
        return await deleteMasterImageEventRouteHandler(req, res) as PartialAnalysisLog | undefined;
    }
}
