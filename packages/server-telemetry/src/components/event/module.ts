/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Component } from '@privateaim/server-kit';
import { isQueueRouterUsable, useLogger, useQueueRouter } from '@privateaim/server-kit';
import { EventTaskQueueRouterRouting } from './constants';
import { EnvironmentName, useEnv } from '../../config';
import { definEventComponentHandlers } from './handlers';

export function defineEventComponent() : Component {
    return {
        async start() {
            const handlers = definEventComponentHandlers();
            await handlers.setup();

            if (
                isQueueRouterUsable() &&
                useEnv('env') !== EnvironmentName.TEST
            ) {
                const queueRouter = useQueueRouter();

                await queueRouter.consumeAny(
                    EventTaskQueueRouterRouting,
                    async (
                        payload,
                    ) => handlers.execute(
                        payload.type,
                        payload.data,
                        payload.metadata,
                    ),
                );
            } else {
                useLogger().warn('Event component can not consume tasks.');
            }
        },
    };
}
