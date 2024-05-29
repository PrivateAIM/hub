/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildQueueRouterPublishPayload } from '@privateaim/server-kit';
import type { QueueRouterPayload } from '@privateaim/server-kit';
import { ComponentName } from '../../constants';
import type { RegistryCommandContext } from '../type';

export function buildRegistryQueueRouterPayload(
    context: RegistryCommandContext,
) : QueueRouterPayload {
    return buildQueueRouterPublishPayload({
        type: context.command,
        data: context.data,
        metadata: {
            routing: {
                type: 'work',
                key: ComponentName.REGISTRY,
            },
        },
    });
}
