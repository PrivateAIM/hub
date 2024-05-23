/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PublishOptionsExtended } from 'amqp-extension';
import { ComponentName, ROUTER_QUEUE_ROUTING_KEY } from '../../constants';
import type { QueueRouterPayload } from '../../types';
import type { CoreCommandContext } from './types';

export function buildCoreQueuePayload(
    context: CoreCommandContext,
) : PublishOptionsExtended<QueueRouterPayload> {
    return {
        exchange: {
            routingKey: ROUTER_QUEUE_ROUTING_KEY,
        },
        content: {
            data: context.data,
            metadata: {
                component: ComponentName.CORE,
                command: context.command,
            },
        },
    };
}
