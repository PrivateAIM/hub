/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { QueueRouterPayload } from '@privateaim/server-kit';
import { buildQueueRouterPublishPayload } from '@privateaim/server-kit';
import { cleanupPayload } from '../../utils';
import {
    BuilderEventQueueRouterRouting,
    BuilderTaskQueueRouterRouting,
} from './constants';
import type { BuilderCommandContext, BuilderEventContext } from './types';

export function buildBuilderTaskQueueRouterPayload(
    context: BuilderCommandContext,
) : QueueRouterPayload {
    return buildQueueRouterPublishPayload({
        type: context.command,
        data: cleanupPayload(context.data),
        metadata: {
            routing: BuilderTaskQueueRouterRouting,
        },
    });
}

export function buildBuilderEventQueueRouterPayload(
    context: BuilderEventContext,
) : QueueRouterPayload {
    return buildQueueRouterPublishPayload({
        type: context.event,
        data: cleanupPayload(context.data),
        metadata: {
            routing: BuilderEventQueueRouterRouting,
        },
    });
}
