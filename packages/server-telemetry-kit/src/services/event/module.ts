/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { buildQueueRouterPublishPayload, isQueueRouterUsable, useQueueRouter } from '@privateaim/server-kit';
import type { EventCommandContext, EventEventContext } from '../../components';
import { EventEventQueueRouterRouting, EventTaskQueueRouterRouting } from '../../components';

export class EventComponentService {
    async command(ctx: EventCommandContext) {
        if (isQueueRouterUsable()) {
            const queueRouter = useQueueRouter();

            const queueRouterPayload = buildQueueRouterPublishPayload({
                type: ctx.command,
                data: ctx.data,
                metadata: {
                    routing: EventTaskQueueRouterRouting,
                },
            });

            await queueRouter.publish(queueRouterPayload);
        }

        throw new Error(`Event command ${ctx.command} can not be executed.`);

        // todo: execute component directly
    }

    async event(ctx: EventEventContext) {
        if (isQueueRouterUsable()) {
            const queueRouter = useQueueRouter();

            const queueRouterPayload = buildQueueRouterPublishPayload({
                type: ctx.event,
                data: ctx.data,
                metadata: {
                    routing: EventEventQueueRouterRouting,
                },
            });

            await queueRouter.publish(queueRouterPayload);
        }

        throw new Error(`Event event ${ctx.event} can not be transmitted.`);

        // todo: execute component directly
    }
}
