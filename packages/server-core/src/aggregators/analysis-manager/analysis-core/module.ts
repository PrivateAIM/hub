/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/kit';
import {
    AnalysisCoreEventQueueRouterRouting,
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
    defineAnalysisCoreHandlers,
} from './handlers';

export function createAnalysisCoreAggregator() : Aggregator {
    if (!isQueueRouterUsable()) {
        useLogger().warn('Analysis core aggregator can not consume events.');
        return { start: () => Promise.resolve() };
    }

    if (useEnv('env') === EnvironmentName.TEST) {
        useLogger().warn('Analysis core aggregator is disabled in test environment.');
        return { start: () => Promise.resolve() };
    }

    const handlers = defineAnalysisCoreHandlers({
        emitter: new QueueRouterComponentEmitter(),
    });

    return {
        async start() {
            await handlers.initialize();

            const queueRouter = useQueueRouter();

            await queueRouter.consumeAny(
                AnalysisCoreEventQueueRouterRouting,
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
