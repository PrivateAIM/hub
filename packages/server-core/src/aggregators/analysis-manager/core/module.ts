/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { CoreEventQueueRouterRouting } from '@privateaim/server-analysis-manager-kit';
import type { Aggregator } from '@privateaim/server-kit';
import { isQueueRouterUsable, useLogger, useQueueRouter } from '@privateaim/server-kit';
import { EnvironmentName, useEnv } from '../../../config';
import { createAnalysisManagerCoreHandlers } from './handler';

export function createAnalysisManagerCoreAggregator() : Aggregator {
    if (!isQueueRouterUsable() || useEnv('env') === EnvironmentName.TEST) {
        return {
            start() {
                useLogger().warn('Analysis worker core component could not been initialized');
            },
        };
    }

    const queueRouter = useQueueRouter();

    return {
        start: () => queueRouter.consume(
            CoreEventQueueRouterRouting,
            createAnalysisManagerCoreHandlers(),
        ),
    };
}
