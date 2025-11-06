/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/kit';
import {
    CoreEventQueueRouterRouting,
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
    const handlers = defineAnalysisCoreHandlers({
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
                    CoreEventQueueRouterRouting,
                    async (
                        payload,
                    ) => handlers.execute(
                        payload.type,
                        payload.data,
                        payload.metadata,
                    ),
                );
            } else {
                useLogger().warn('Analysis core aggregator can not consume events.');
            }
        },
    };
}
