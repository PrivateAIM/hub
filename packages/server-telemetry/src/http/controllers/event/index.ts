/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Event } from '@privateaim/telemetry-kit';
import {
    DController, DDelete, DGet, DPath, DPost, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    createEventRouteHandler,
    deleteEventRouteHandler,
    getManyEventLogRouteHandler,
    getOneEventLogRouteHandler,
} from './handlers/index.ts';

type PartialEvent = Partial<Event>;

@DTags('events')
@DController('/events')
export class EventController {
    @DPost('', [ForceLoggedInMiddleware])
    async create(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialEvent[]> {
        return await createEventRouteHandler(req, res) as PartialEvent[];
    }

    @DGet('', [ForceLoggedInMiddleware])
    async getMany(
        @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialEvent[]> {
        return await getManyEventLogRouteHandler(req, res) as PartialEvent[];
    }

    @DGet('/:id', [ForceLoggedInMiddleware])
    async getOne(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialEvent | undefined> {
        return await getOneEventLogRouteHandler(req, res) as PartialEvent | undefined;
    }

    @DDelete('/:id', [ForceLoggedInMiddleware])
    async drop(
        @DPath('id') id: string,
            @DRequest() req: any,
            @DResponse() res: any,
    ): Promise<PartialEvent | undefined> {
        return await deleteEventRouteHandler(req, res) as PartialEvent | undefined;
    }
}
