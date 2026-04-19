/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import { LoggerInjectionKey, QueueRouterInjectionKey } from '@privateaim/server-kit';
import { BucketFileEventCaller } from '@privateaim/server-storage-kit';
import { BucketController } from '../../../adapters/http/controllers/bucket/module.ts';
import { BucketFileController } from '../../../adapters/http/controllers/bucket-file/module.ts';
import { RootController } from '../../../adapters/http/controllers/root/index.ts';
import { BucketComponent } from '../../components/bucket/module.ts';
import { BucketFileComponent } from '../../components/bucket-file/module.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { MinioClientInjectionKey } from '../minio/constants.ts';

export function createControllers(container: IContainer): Record<string, any>[] {
    const dataSource = container.resolve(DatabaseInjectionKey.DataSource);
    const minio = container.resolve(MinioClientInjectionKey);

    const loggerResult = container.tryResolve(LoggerInjectionKey);
    const logger = loggerResult.success ? loggerResult.data : undefined;

    const queueRouterResult = container.tryResolve(QueueRouterInjectionKey);
    const queueRouter = queueRouterResult.success ? queueRouterResult.data : undefined;

    const bucketComponent = new BucketComponent({ minio, logger });
    const bucketFileComponent = new BucketFileComponent({ minio, logger });
    const bucketFileEventCaller = new BucketFileEventCaller({ queueRouter });

    return [
        new BucketController({
            dataSource,
            minio,
            bucketComponent,
            bucketFileComponent,
            bucketFileEventCaller,
            logger,
        }),
        new BucketFileController({
            dataSource,
            minio,
            bucketFileComponent,
            bucketFileEventCaller,
            logger,
        }),
        new RootController(),
    ];
}
