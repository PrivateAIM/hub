/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import type { Component } from '@privateaim/server-kit';
import { LoggerInjectionKey, QueueRouterInjectionKey, QueueWorkerComponentCaller } from '@privateaim/server-kit';
import { BucketEventQueueRouterRouting, BucketTaskQueueRouterRouting } from '@privateaim/server-storage-kit';
import { BucketComponent } from '../../components/bucket/index.ts';
import { MinioClientInjectionKey } from '../minio/constants.ts';

export class ComponentsModule implements IModule {
    readonly name = 'components';

    readonly dependencies: string[] = ['minio', 'database'];

    async setup(container: IContainer): Promise<void> {
        const minio = container.resolve(MinioClientInjectionKey);

        const loggerResult = container.tryResolve(LoggerInjectionKey);
        const logger = loggerResult.success ? loggerResult.data : undefined;
        const queueRouterResult = container.tryResolve(QueueRouterInjectionKey);
        const queueRouter = queueRouterResult.success ? queueRouterResult.data : undefined;

        const components : Component<any>[] = [
            new QueueWorkerComponentCaller(new BucketComponent({ minio, logger }), {
                consumeQueue: BucketTaskQueueRouterRouting,
                publishQueue: BucketEventQueueRouterRouting,
                queueRouter,
                logger,
            }),
        ];

        const promises = components.map((c) => c.start());
        await Promise.all(promises);
    }
}
