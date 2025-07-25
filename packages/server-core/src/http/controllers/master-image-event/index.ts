/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Event } from '@privateaim/core-kit';
import {
    DController, DDelete, DGet, DPath, DRequest, DResponse, DTags,
} from '@routup/decorators';
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
import {
    deleteEventRouteHandler,
    getManyEventLogRouteHandler,
    getOneEventLogRouteHandler,
} from './handlers';

type PartialEvent = Partial<Event>;

@DTags('events')
@DController('/events')
export class EventController {
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
