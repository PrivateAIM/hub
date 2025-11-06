/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName, wait } from '@privateaim/kit';
import type { Component } from '@privateaim/server-kit';
import {
    ComponentHandlers,
    buildQueueRouterPublishPayload, isQueueRouterUsable, useLogger, useQueueRouter,
} from '@privateaim/server-kit';
import { useEnv } from '@privateaim/server-telemetry';
import type { ObjectLiteral } from 'rapiq';
import { AnalysisConfigurationCommand, AnalysisConfigurationTaskQueue } from './constants';
import { AnalysisConfigurationRecalcHandler } from './handlers';

export function createAnalysisConfigurationComponent(): Component {
    const manager = new ComponentHandlers();

    manager.mount(AnalysisConfigurationCommand.RECALC, new AnalysisConfigurationRecalcHandler());

    return {
        async start() {
            await manager.initialize();

            if (
                isQueueRouterUsable() &&
                useEnv('env') !== EnvironmentName.TEST
            ) {
                const queueRouter = useQueueRouter();

                await queueRouter.consumeAny(
                    AnalysisConfigurationTaskQueue,
                    (
                        payload,
                    ) => manager.execute(
                        payload.type,
                        payload.data,
                        payload.metadata,
                    ),
                );
            } else {
                useLogger().warn('Analysis configuration component can not consume tasks.');
            }
        },
        async trigger(
            key: string,
            value?: ObjectLiteral,
            metadata: ObjectLiteral = {},
        ) {
            if (
                isQueueRouterUsable() &&
                useEnv('env') !== EnvironmentName.TEST
            ) {
                const payload = buildQueueRouterPublishPayload({
                    type: key,
                    data: value,
                    metadata: {
                        routing: AnalysisConfigurationTaskQueue,
                        ...metadata,
                    },
                });

                const queueRouter = useQueueRouter();
                await wait(500)
                    .then(() => queueRouter.publish(payload));
            } else {
                await manager.execute(key, value, metadata);
            }
        },
    };
}
