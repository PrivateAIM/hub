/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { generateSwagger } from '@privateaim/server-http-kit';
import type { Component } from '@privateaim/server-kit';
import { QueueWorkerComponentCaller, useLogger } from '@privateaim/server-kit';
import { BucketEventQueueRouterRouting, BucketTaskQueueRouterRouting } from '@privateaim/server-storage-kit';
import { defineCommand } from 'citty';
import path from 'node:path';
import process from 'node:process';
import { useBucketComponent } from '../../components/index.ts';
import { configure, useEnv } from '../../config/index.ts';
import { setupDatabase } from '../../config/services/index.ts';
import { createHttpServer } from '../../http/index.ts';

export function defineCLIStartCommand() {
    return defineCommand({
        meta: {
            name: 'start',
        },
        async setup() {
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

            const promises = components.map(
                (component) => component.start(),
            );
            await Promise.all(promises);

            const logger = useLogger();
            httpServer.on('error', (err) => {
                logger.error(err);
                process.exit(1);
            });

            const port = useEnv('port');
            httpServer.listen(port, () => {
                logger.debug(`Listening on 0.0.0.0:${port}`);
            });
        },
    });
}
