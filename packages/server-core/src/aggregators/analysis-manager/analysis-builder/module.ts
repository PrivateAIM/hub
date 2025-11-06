/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/kit';
import {
    AnalysisBuilderEventQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import type { Aggregator } from '@privateaim/server-kit';
import {
    QueueRouterComponentEmitter,
    isQueueRouterUsable,
    useLogger,
    useQueueRouter,
} from '@privateaim/server-kit';
import { useEnv } from '../../../config';
import {
    defineAnalysisBuilderHandlers,
} from './handlers';

export function createAnalysisBuilderAggregator() : Aggregator {
    if (!isQueueRouterUsable()) {
        useLogger().warn('Analysis builder aggregator can not consume events.');
        return { start: () => Promise.resolve() };
    }

    if (useEnv('env') === EnvironmentName.TEST) {
        useLogger().warn('Analysis builder aggregator is disabled in test environment.');
        return { start: () => Promise.resolve() };
    }

    const handlers = defineAnalysisBuilderHandlers({
        emitter: new QueueRouterComponentEmitter(),
    });

    return {
        async start() {
            await handlers.initialize();

            const queueRouter = useQueueRouter();

            await queueRouter.consumeAny(
                AnalysisBuilderEventQueueRouterRouting,
                async (
                    payload,
                ) => handlers.execute(
                    payload.type,
                    payload.data,
                    payload.metadata,
                ),
            );
        },
    };
}
