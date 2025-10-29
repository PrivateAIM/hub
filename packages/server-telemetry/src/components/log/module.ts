/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/kit';
import type { Component } from '@privateaim/server-kit';
import { isQueueRouterUsable, useLogger, useQueueRouter } from '@privateaim/server-kit';
import { LogTaskQueueRouterRouting } from '@privateaim/server-telemetry-kit';
import { useEnv } from '../../config';
import { definLogComponentHandlers } from './handlers';

export function defineLogComponent() : Component {
    return {
        async start() {
            const handlers = definLogComponentHandlers();
            await handlers.initialize();

            if (
                isQueueRouterUsable() &&
                useEnv('env') !== EnvironmentName.TEST
            ) {
                const queueRouter = useQueueRouter();

                await queueRouter.consumeAny(
                    LogTaskQueueRouterRouting,
                    (
                        payload,
                    ) => handlers.execute(
                        payload.type,
                        payload.data,
                        payload.metadata,
                    ),
                );
            } else {
                useLogger().warn('Log component can not consume tasks.');
            }
        },
    };
}
