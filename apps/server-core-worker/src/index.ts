/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

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
    MasterImageBuilderComponent,
    MasterImageSynchronizerComponent,
    useAnalysisBuilderComponent,
    useAnalysisDistributorComponent,
} from './components';
import { useEnv } from './config';
import { createHttpServer } from './http';
import { createApplication } from './app';

async function start() {
    const app = createApplication();
    await app.setup();

    const components: Component[] = [
        new QueueWorkerComponentCaller(
            useAnalysisBuilderComponent(),
            {
                publishQueue: AnalysisBuilderEventQueueRouterRouting,
                consumeQueue: AnalysisBuilderTaskQueueRouterRouting,
            },
        ),
        new QueueWorkerComponentCaller(
            useAnalysisDistributorComponent(),
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

    components.forEach((c) => c.start());

    const server = createHttpServer();
    const port = useEnv('port');
    server.listen(port);

    useLogger().debug(`Listening on 0.0.0.0:${port}`);
}

start();
