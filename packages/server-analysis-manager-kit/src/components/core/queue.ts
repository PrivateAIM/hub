/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { QueueRouterPayload } from '@privateaim/server-kit';
import { buildQueueRouterPublishPayload } from '@privateaim/server-kit';
import {cleanupPayload} from "../../utils";
import {CoreEventQueueRouterRouting, CoreTaskQueueRouterRouting} from './constants';
import type { CoreCommandContext } from './types';

export function buildCoreTaskQueueRouterPayload(
    context: CoreCommandContext,
) : QueueRouterPayload {
    return buildQueueRouterPublishPayload({
        type: context.command,
        data: cleanupPayload(context.data),
        metadata: {
            routing: CoreTaskQueueRouterRouting,
        },
    });
}

export function buildCoreEventQueueRouterPayload(
    context: CoreCommandContext,
) : QueueRouterPayload {
    return buildQueueRouterPublishPayload({
        type: context.command,
        data: cleanupPayload(context.data),
        metadata: {
            routing: CoreEventQueueRouterRouting,
        },
    });
}
