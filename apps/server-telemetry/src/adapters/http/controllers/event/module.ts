/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    DBody,
    DContext,
    DController,
    DDelete,
    DGet,
    DPath,
    DPost,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import type { IRoutupEvent } from 'routup';
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
        @DContext() event: IRoutupEvent,
    ) {
        const actor = buildActorContext(event);
        const entity = await this.service.create(data, actor);
        event.response.status = 201;
        return entity;
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IRoutupEvent,
    ) {
        const actor = buildActorContext(event);
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query, actor);
        return { data, meta };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DContext() event: IRoutupEvent,
    ) {
        const actor = buildActorContext(event);
        return this.service.getOne(id, actor);
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DContext() event: IRoutupEvent,
    ) {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);
        event.response.status = 202;
        return entity;
    }
}
