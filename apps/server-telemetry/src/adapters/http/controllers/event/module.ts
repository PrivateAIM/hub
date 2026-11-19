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
    DStatus,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import type {
    EntityCollectionResponse,
    EntityRecordResponse,
    Event,
} from '@privateaim/telemetry-kit';
import { ForceLoggedInMiddleware, buildActorContext } from '@privateaim/server-http-kit';
import { RECORD_QUERY_PARAMETERS, describeQuerySchema } from '@privateaim/server-kit';
import type { IAppEvent } from 'routup';
import type { IEventService } from '../../../../core/entities/index.ts';
import { eventSchema } from '../../../../core/entities/index.ts';

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
    @DStatus(201)
    async create(
        @DBody() data: Partial<Event>,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Event>> {
        const actor = buildActorContext(event);
        const entity = await this.service.create(data, actor);

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
    @DStatus(202)
    async drop(
        @DPath('id') id: string,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Event>> {
        const actor = buildActorContext(event);
        const entity = await this.service.delete(id, actor);

        return { data: entity, meta: {} };
    }
}
