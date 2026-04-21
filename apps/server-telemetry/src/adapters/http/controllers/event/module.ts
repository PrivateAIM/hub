/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DBody,
    DController,
    DDelete,
    DGet,
    DPath,
    DPost,
    DRequest,
    DResponse,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { Request, Response } from 'routup';
import type { IEventService } from '../../../../core/entities/index.ts';
import { buildActorContext } from '../../request/index.ts';

type EventControllerContext = {
    service: IEventService;
};

@DTags('events')
@DController('/events')
export class EventController {
    protected service: IEventService;

    constructor(ctx: EventControllerContext) {
        this.service = ctx.service;
    }

    @DPost('', [ForceLoggedInMiddleware])
    async create(
        @DBody() data: any,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        const actor = buildActorContext(req);
        const entity = await this.service.create(data, actor);
        res.statusCode = 201;
        return entity;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: Request,
    ) {
        const actor = buildActorContext(req);
        const query = useRequestQuery(req);
        const { data, meta } = await this.service.getMany(query, actor);
        return { data, meta };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DRequest() req: Request,
    ) {
        const actor = buildActorContext(req);
        return this.service.getOne(id, actor);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DRequest() req: Request,
        @DResponse() res: Response,
    ) {
        const actor = buildActorContext(req);
        const entity = await this.service.delete(id, actor);
        res.statusCode = 202;
        return entity;
    }
}
