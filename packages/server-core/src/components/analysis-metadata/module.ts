/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/kit';
import type { Component } from '@privateaim/server-kit';
import {
    ComponentHandlers,
    buildQueueRouterPublishPayload, isQueueRouterUsable, useLogger, useQueueRouter,
} from '@privateaim/server-kit';
import { useEnv } from '@privateaim/server-telemetry';
import type { ObjectLiteral } from 'rapiq';
import { AnalysisMetadataCommand, AnalysisMetadataTaskQueue } from './constants';
import { AnalysisMetadataRecalcHandler } from './handlers';

export function createAnalysisMetadataComponent(): Component {
    const manager = new ComponentHandlers();

    manager.mount(AnalysisMetadataCommand.RECALC, new AnalysisMetadataRecalcHandler());

    return {
        async start() {
            await manager.initialize();

            if (
                isQueueRouterUsable() &&
                useEnv('env') !== EnvironmentName.TEST
            ) {
                const queueRouter = useQueueRouter();

                await queueRouter.consumeAny(
                    AnalysisMetadataTaskQueue,
                    (
                        payload,
                    ) => manager.execute(
                        payload.type,
                        payload.data,
                        payload.metadata,
                    ),
                );
            } else {
                useLogger().warn('Analysis metadata component can not consume tasks.');
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
                        routing: AnalysisMetadataTaskQueue,
                        ...metadata,
                    },
                });

                const queueRouter = useQueueRouter();
                await queueRouter.publish(payload);
            } else {
                await manager.execute(key, value, metadata);
            }
        },
    };
}
