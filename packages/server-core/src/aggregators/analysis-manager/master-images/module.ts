/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useMasterImageQueueService } from '@privateaim/server-core-worker-kit';
import { EnvironmentName, isQueueRouterUsable, useLogger } from '@privateaim/server-kit';
import type { Aggregator } from '@privateaim/server-kit';
import { useEnv } from '../../../config';
import { createAnalysisManagerMasterImagesHandlers } from './handlers';

export function createAnalysisManagerMasterImagesAggregator() : Aggregator {
    if (!isQueueRouterUsable() || useEnv('env') === EnvironmentName.TEST) {
        return {
            start() {
                useLogger().warn('master-images component of worker service could not been initialized.');
            },
        };
    }

    const queue = useMasterImageQueueService();

    return {
        start: () => queue.consumeEvents(createAnalysisManagerMasterImagesHandlers()),
    };
}
