/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Component } from '@privateaim/server-kit';
import type { EventCommandContext, EventEventContext } from '@privateaim/server-telemetry-kit';
import {
    EventComponentService as BaseEventComponentService,
} from '@privateaim/server-telemetry-kit';
import { definEventComponentHandlers } from '../../components/event/handlers';

export class EventComponentService extends BaseEventComponentService {
    protected eventHandlers: Component;

    constructor() {
        super();

        this.eventHandlers = definEventComponentHandlers();
    }

    async command(ctx: EventCommandContext) {
        try {
            await super.command(ctx);
        } catch (e) {
            await this.eventHandlers.execute(ctx.command, ctx.data, {});
        }
    }

    async event(ctx: EventEventContext) {
        try {
            await super.event(ctx);
        } catch (e) {
            await this.eventHandlers.execute(ctx.event, ctx.data, { });
        }
    }
}
