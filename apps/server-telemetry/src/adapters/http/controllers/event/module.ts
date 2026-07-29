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
import type {
    EntityCollectionResponse,
    EntityRecordResponse,
    Event,
} from '@privateaim/telemetry-kit';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import { RECORD_QUERY_PARAMETERS, describeQuerySchema } from '@privateaim/server-kit';
import type { IAppEvent } from 'routup';
import type { IEventService } from '../../../../core/entities/index.ts';
import { eventSchema } from '../../../../core/entities/index.ts';
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
        @DBody() data: Partial<Event>,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Event>> {
        const actor = buildActorContext(event);
        const entity = await this.service.create(data, actor);
        event.response.status = 201;

        return { data: entity, meta: {} };
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IAppEvent,
    ): Promise<EntityCollectionResponse<Event>> {
        const actor = buildActorContext(event);
        const query = useRequestQuery(event);
        const { data, meta } = await this.service.getMany(query, actor);

        return { data, meta: { ...meta, schema: describeQuerySchema(eventSchema) } };
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Event>> {
        const actor = buildActorContext(event);
        const entity = await this.service.getOne(id, actor);

        return {
            data: entity,
            meta: { schema: describeQuerySchema(eventSchema, RECORD_QUERY_PARAMETERS) },
        };
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Event>> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);
        event.response.status = 202;

        return { data: entity, meta: {} };
    }
}
