/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DController,
    DDelete,
    DGet,
    DPost,
    DRequest,
    DResponse,
    DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { Request, Response } from 'routup';
import type { LogStore } from '../../../../core/services/log-store/types.ts';
import {
    createLogRouteHandler,
    deleteManyLogRouteHandler,
    getManyLogLogRouteHandler,
} from './handlers/index.ts';

@DTags('logs')
@DController('/logs')
export class LogController {
    private logStore: LogStore;

    constructor(ctx: { logStore: LogStore }) {
        this.logStore = ctx.logStore;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async create(
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return createLogRouteHandler(req, res, this.logStore);
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return getManyLogLogRouteHandler(req, res, this.logStore);
    }

    @DDelete('', [ForceLoggedInMiddleware])
    async deleteMany(
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return deleteManyLogRouteHandler(req, res, this.logStore);
    }
}
