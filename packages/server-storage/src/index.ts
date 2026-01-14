/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { generateSwagger } from '@privateaim/server-http-kit';
import type { Component } from '@privateaim/server-kit';
import { QueueWorkerComponentCaller } from '@privateaim/server-kit';
import { config } from 'dotenv';
import path from 'node:path';
import process from 'node:process';
import { BucketEventQueueRouterRouting, BucketTaskQueueRouterRouting } from '@privateaim/server-storage-kit';
import { useBucketComponent } from './components/index.ts';
import { configure, useEnv } from './config/index.ts';
import { setupDatabase } from './config/services/index.ts';
import {
    createHttpServer,
} from './http/index.ts';

(async () => {
    config();

    configure();
    await setupDatabase();

    await generateSwagger({
        authupURL: useEnv('authupURL'),
        baseURL: useEnv('publicURL'),
        controllerBasePath: path.join(process.cwd(), 'src', 'http', 'controllers'),
    });

    const httpServer = createHttpServer();

    const components : Component<any>[] = [
        new QueueWorkerComponentCaller(useBucketComponent(), {
            consumeQueue: BucketTaskQueueRouterRouting,
            publishQueue: BucketEventQueueRouterRouting,
        }),
    ];

    function start() {
        const port = useEnv('port');
        httpServer.listen(port);

        components.map((component) => component.start());

        console.log(`Listening on 0.0.0.0:${port}`);
    }

    start();
})();
