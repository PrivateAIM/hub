/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    EntityCollectionResponse,
    EntityRecordResponse,
    Log,
    LogInput,
} from '@privateaim/telemetry-kit';
import {
    DBody,
    DConsumes,
    DContext,
    DController,
    DDelete,
    DGet,
    DPost,
    DStatus,
    DTags,
} from '@routup/decorators';
import { useRequestQuery } from '@routup/basic/query';
import { ForceLoggedInMiddleware, buildActorContext } from '@privateaim/server-http-kit';
import type { IAppEvent } from 'routup';
import type { ILogService } from '../../../../core/index.ts';

@DTags('logs')
@DController('/logs')
export class LogController {
    protected service: ILogService;

    constructor(ctx: { service: ILogService }) {
        this.service = ctx.service;
    }

    @DPost('', [ForceLoggedInMiddleware])
    @DConsumes('application/json')
    @DStatus(201)
    async create(
        @DBody() body: LogInput,
        @DContext() event: IAppEvent,
    ): Promise<EntityRecordResponse<Log>> {
        const entity = await this.service.create(body, buildActorContext(event));

        return { data: entity, meta: {} };
    }

    /**
     * The one collection endpoint that deliberately carries no `meta.schema`:
     * its filters are dynamic VictoriaLogs labels, so there is nothing to describe.
     */
    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DContext() event: IAppEvent,
    ): Promise<EntityCollectionResponse<Log>> {
        return this.service.getMany(useRequestQuery(event), buildActorContext(event));
    }

    @DDelete('', [ForceLoggedInMiddleware])
    @DStatus(202)
    async deleteMany(
        @DContext() event: IAppEvent,
    ) {
        await this.service.deleteMany(useRequestQuery(event), buildActorContext(event));

        return null;
    }
}
