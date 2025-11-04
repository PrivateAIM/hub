/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Component } from '@privateaim/server-kit';
import {
    QueueRouterComponentEmitter, isQueueRouterUsable, useLogger, useQueueRouter,
} from '@privateaim/server-kit';
import { useEnv } from '@privateaim/server-telemetry/src';
import { EnvironmentName } from '@privateaim/kit';
import { AnalysisDistributorTaskQueueRouterRouting } from '@privateaim/server-core-worker-kit';
import { defineAnalysisDistributorHandlers } from './handlers';

export function createAnalysisDistributorComponent() : Component {
    const handlers = defineAnalysisDistributorHandlers({
        emitter: new QueueRouterComponentEmitter(),
    });

    return {
        async start() {
            await handlers.initialize();

            if (
                isQueueRouterUsable() &&
                useEnv('env') !== EnvironmentName.TEST
            ) {
                const queueRouter = useQueueRouter();

                await queueRouter.consumeAny(
                    AnalysisDistributorTaskQueueRouterRouting,
                    async (
                        payload,
                    ) => handlers.execute(
                        payload.type,
                        payload.data,
                        payload.metadata,
                    ),
                );
            } else {
                useLogger().warn('Analysis distributor component can not consume tasks.');
            }
        },
    };
}
