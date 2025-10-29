/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/kit';
import type { Component } from '@privateaim/server-kit';
import {
    ComponentHandlers, isQueueRouterUsable, useLogger, useQueueRouter,
} from '@privateaim/server-kit';
import { useEnv } from '@privateaim/server-telemetry';
import { AnalysisConfigurationCommand, AnalysisConfigurationTaskQueue } from './constants';
import { AnalysisConfigurationRecalcHandler } from './handlers';

export function createAnalysisConfigurationComponent(): Component {
    return {
        async start() {
            const manager = new ComponentHandlers();

            manager.mount(AnalysisConfigurationCommand.RECALC, new AnalysisConfigurationRecalcHandler());

            await manager.setup();

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
    };
}
