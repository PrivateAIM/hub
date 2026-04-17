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
import { BucketComponent } from '../../app/components/index.ts';
import { createApplication } from '../../app/index.ts';
import { useEnv } from '../../app/modules/config/index.ts';
import { MinioClientInjectionKey } from '../../app/modules/minio/index.ts';

export function defineCLIStartCommand() {
    return defineCommand({
        meta: { name: 'start' },
        async setup() {
            const app = createApplication();
            await app.setup();

            const minio = app.container.resolve(MinioClientInjectionKey);

            await generateSwagger({
                authupURL: useEnv('authupURL'),
                baseURL: useEnv('publicURL'),
                controllerBasePath: path.join(process.cwd(), 'src', 'adapters', 'http', 'controllers'),
            });

            const components : Component<any>[] = [
                new QueueWorkerComponentCaller(new BucketComponent({ minio }), {
                    consumeQueue: BucketTaskQueueRouterRouting,
                    publishQueue: BucketEventQueueRouterRouting,
                }),
            ];

            const promises = components.map(
                (component) => component.start(),
            );
            await Promise.all(promises);

            const logger = useLogger();
            logger.debug('Application started successfully.');
        },
    });
}
