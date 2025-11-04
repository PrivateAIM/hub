/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AnalysisBuilderTaskQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import {
    EnvironmentName, QueueRouterComponentEmitter, isQueueRouterUsable, useLogger, useQueueRouter,
} from '@privateaim/server-kit';
import type { Component } from '@privateaim/server-kit';
import { useEnv } from '../../config';

import { defineAnalysisBuilderHandlers } from './handlers';

export function createAnalysisBuilderComponent() : Component {
    const handlers = defineAnalysisBuilderHandlers({
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
                    AnalysisBuilderTaskQueueRouterRouting,
                    async (
                        payload,
                    ) => handlers.execute(
                        payload.type,
                        payload.data,
                        payload.metadata,
                    ),
                );
            } else {
                useLogger().warn('Analysis builder component can not consume tasks.');
            }
        },
    };
}
