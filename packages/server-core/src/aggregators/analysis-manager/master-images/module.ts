/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MasterImagesEventQueueRouterRouting } from '@privateaim/server-analysis-manager-kit';
import { isQueueRouterUsable, useLogger, useQueueRouter } from '@privateaim/server-kit';
import type { Aggregator } from '@privateaim/server-kit';
import { EnvironmentName, useEnv } from '../../../config';
import { createAnalysisManagerMasterImagesHandlers } from './handlers';

export function createAnalysisManagerMasterImagesAggregator() : Aggregator {
    if (!isQueueRouterUsable() || useEnv('env') === EnvironmentName.TEST) {
        return {
            start() {
                useLogger().warn('master-images component of worker service could not been initialized.');
            },
        };
    }

    const queueRouter = useQueueRouter();

    return {
        start: () => queueRouter.consume(
            MasterImagesEventQueueRouterRouting,
            createAnalysisManagerMasterImagesHandlers(),
        ),
    };
}
