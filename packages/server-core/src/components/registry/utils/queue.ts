/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PublishOptionsExtended } from 'amqp-extension';
import type { QueueRouterPayload } from '@privateaim/server-kit';
import { ComponentName } from '../../constants';
import { QUEUE_ROUTER_ROUTING_KEY } from '../../../constants';
import type { RegistryCommandContext } from '../type';

export function buildRegistryPayload(
    context: RegistryCommandContext,
) : PublishOptionsExtended<QueueRouterPayload> {
    return {
        exchange: {
            routingKey: QUEUE_ROUTER_ROUTING_KEY,
        },
        content: {
            data: context.data,
            metadata: {
                component: ComponentName.REGISTRY,
                command: context.command,
            },
        },
    };
}
