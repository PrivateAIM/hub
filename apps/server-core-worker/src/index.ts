/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import 'dotenv/config';
import type { Component } from '@privateaim/server-kit';
import { QueueWorkerComponentCaller, useLogger } from '@privateaim/server-kit';
import {
    AnalysisBuilderEventQueueRouterRouting,
    AnalysisBuilderTaskQueueRouterRouting,
    AnalysisDistributorEventQueueRouterRouting,
    AnalysisDistributorTaskQueueRouterRouting,
    MasterImageBuilderEventQueueRouterRouting,
    MasterImageBuilderTaskQueueRouterRouting,
    MasterImageSynchronizerEventQueueRouterRouting,
    MasterImageSynchronizerTaskQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import {
    AnalysisBuilderComponent,
    AnalysisDistributorComponent,
    MasterImageBuilderComponent,
    MasterImageSynchronizerComponent,
} from './app/components';
import { createApplication } from './app';

async function start() {
    const app = createApplication();
    await app.setup();

    const components: Component[] = [
        new QueueWorkerComponentCaller(
            new AnalysisBuilderComponent(),
            {
                publishQueue: AnalysisBuilderEventQueueRouterRouting,
                consumeQueue: AnalysisBuilderTaskQueueRouterRouting,
            },
        ),
        new QueueWorkerComponentCaller(
            new AnalysisDistributorComponent(),
            {
                publishQueue: AnalysisDistributorEventQueueRouterRouting,
                consumeQueue: AnalysisDistributorTaskQueueRouterRouting,
            },
        ),
        new QueueWorkerComponentCaller(
            new MasterImageBuilderComponent(),
            {
                publishQueue: MasterImageBuilderEventQueueRouterRouting,
                consumeQueue: MasterImageBuilderTaskQueueRouterRouting,
            },
        ),
        new QueueWorkerComponentCaller(
            new MasterImageSynchronizerComponent(),
            {
                publishQueue: MasterImageSynchronizerEventQueueRouterRouting,
                consumeQueue: MasterImageSynchronizerTaskQueueRouterRouting,
            },
        ),
    ];

    const promises = components.map((c) => c.start());
    await Promise.all(promises);

    const logger = useLogger();
    logger.debug('Application started successfully.');
}

start();
