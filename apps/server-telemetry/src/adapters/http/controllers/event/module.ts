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
    DPath,
    DPost,
    DRequest,
    DResponse,
    DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { DataSource } from 'typeorm';
import type { Request, Response } from 'routup';
import {
    createEventRouteHandler,
    deleteEventRouteHandler,
    getManyEventLogRouteHandler,
    getOneEventLogRouteHandler,
} from './handlers/index.ts';

@DTags('events')
@DController('/events')
export class EventController {
    private dataSource: DataSource;

    constructor(ctx: { dataSource: DataSource }) {
        this.dataSource = ctx.dataSource;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async create(
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return createEventRouteHandler(req, res, this.dataSource);
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return getManyEventLogRouteHandler(req, res, this.dataSource);
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return getOneEventLogRouteHandler(req, res, this.dataSource);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        return deleteEventRouteHandler(req, res, this.dataSource);
    }
}
