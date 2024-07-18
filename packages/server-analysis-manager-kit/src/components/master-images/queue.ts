/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { QueueRouterPayload } from '@privateaim/server-kit';
import { buildQueueRouterPublishPayload } from '@privateaim/server-kit';
import { cleanupPayload } from '../../utils';
import { MasterImagesEventQueueRouterRouting, MasterImagesTaskQueueRouterRouting } from './constants';
import type { MasterImagesCommandContext, MasterImagesEventContext } from './types';

export function buildMasterImagesTaskQueueRouterPayload(
    context: MasterImagesCommandContext,
) : QueueRouterPayload {
    return buildQueueRouterPublishPayload({
        type: context.command,
        data: cleanupPayload(context.data),
        metadata: {
            routing: MasterImagesTaskQueueRouterRouting,
        },
    });
}

export function buildMasterImagesEventQueueRouterPayload(
    context: MasterImagesEventContext,
) : QueueRouterPayload {
    return buildQueueRouterPublishPayload({
        type: context.event,
        data: cleanupPayload(context.data),
        metadata: {
            routing: MasterImagesEventQueueRouterRouting,
        },
    });
}
