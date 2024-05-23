/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { transformComponentErrorForQueuePayload } from '@privateaim/server-kit';
import type { ComponentContextWithError } from '@privateaim/server-kit';
import { ComponentName } from '@privateaim/server-analysis-manager-kit';
import type { CoreEventContext } from '@privateaim/server-analysis-manager-kit';
import { cleanupPayload } from '../../utils';
import { useCoreLogger } from './logger';

export function buildCoreAggregatorQueuePayload(
    context: CoreEventContext | ComponentContextWithError<CoreEventContext>,
) {
    const error = transformComponentErrorForQueuePayload(context);
    if (error) {
        useCoreLogger().error('Command execution failed.', {
            command: context.command,
            ...error,
        });
    }

    return {
        exchange: {
            routingKey: 'api.aggregator.tm',
        },
        content: {
            data: cleanupPayload({ ...context.data }),
            metadata: {
                command: context.command,
                component: ComponentName.CORE,
                event: context.event,
            },
            ...(error ? { error } : {}),
        },
    };
}
