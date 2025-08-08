/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { buildQueueRouterPublishPayload, isQueueRouterUsable, useQueueRouter } from '@privateaim/server-kit';
import { LogEventQueueRouterRouting, LogTaskQueueRouterRouting } from '../../components/log/constants';
import type { LogCommandContext, LogEventContext } from '../../components/log/types';

export class LogComponentService {
    async command(ctx: LogCommandContext) {
        if (isQueueRouterUsable()) {
            const queueRouter = useQueueRouter();

            const queueRouterPayload = buildQueueRouterPublishPayload({
                type: ctx.command,
                data: ctx.data,
                metadata: {
                    routing: LogTaskQueueRouterRouting,
                },
            });

            await queueRouter.publish(queueRouterPayload);
        }

        // todo: execute component directly
    }

    async event(ctx: LogEventContext) {
        if (isQueueRouterUsable()) {
            const queueRouter = useQueueRouter();

            const queueRouterPayload = buildQueueRouterPublishPayload({
                type: ctx.event,
                data: ctx.data,
                metadata: {
                    routing: LogEventQueueRouterRouting,
                },
            });

            await queueRouter.publish(queueRouterPayload);
        }

        // todo: execute component directly
    }
}
