/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Log } from '@privateaim/telemetry-kit';
import {
    DController, DDelete, DGet, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    createLogRouteHandler,
    deleteManyLogRouteHandler,
    getManyLogLogRouteHandler,
} from './handlers/index.ts';

type PartialLog = Partial<Log>;

@DTags('logs')
@DController('/logs')
export class LogController {
    @DPost('', [ForceLoggedInMiddleware])
    async create(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialLog> {
        return await createLogRouteHandler(req, res) as PartialLog;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialLog[]> {
        return await getManyLogLogRouteHandler(req, res) as PartialLog[];
    }

    @DDelete('', [ForceLoggedInMiddleware])
    async deleteMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<void> {
        await deleteManyLogRouteHandler(req, res);
    }
}
