/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import { LoggerInjectionKey, MessageBusInjectionKey } from '@privateaim/server-kit';
import { BucketFileEventCaller } from '@privateaim/server-storage-kit';
import { BucketController } from '../../../adapters/http/controllers/bucket/module.ts';
import { BucketFileController } from '../../../adapters/http/controllers/bucket-file/module.ts';
import { RootController } from '../../../adapters/http/controllers/root/index.ts';
import { BucketService } from '../../../core/entities/bucket/service.ts';
import { BucketFileService } from '../../../core/entities/bucket-file/service.ts';
import { BucketComponent } from '../../components/bucket/module.ts';
import { BucketFileComponent } from '../../components/bucket-file/module.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { MinioClientInjectionKey } from '../minio/constants.ts';
import { BucketCallerAdapter } from './callers/bucket-caller.ts';
import { BucketFileCallerAdapter } from './callers/bucket-file-caller.ts';

export function createControllers(container: IContainer): Record<string, any>[] {
    const bucketRepository = container.resolve(DatabaseInjectionKey.BucketRepository);
    const bucketFileRepository = container.resolve(DatabaseInjectionKey.BucketFileRepository);
    const minio = container.resolve(MinioClientInjectionKey);

    const loggerResult = container.tryResolve(LoggerInjectionKey);
    const logger = loggerResult.success ? loggerResult.data : undefined;

    const messageBusResult = container.tryResolve(MessageBusInjectionKey);
    const messageBus = messageBusResult.success ? messageBusResult.data : undefined;

    const bucketComponent = new BucketComponent({ minio, logger });
    const bucketFileComponent = new BucketFileComponent({ minio, logger });
    const bucketFileEventCaller = new BucketFileEventCaller({ messageBus });

    const bucketCaller = new BucketCallerAdapter(bucketComponent);
    const bucketFileCaller = new BucketFileCallerAdapter(bucketFileComponent, bucketFileEventCaller);

    const bucketService = new BucketService({
        repository: bucketRepository,
        caller: bucketCaller,
        minio,
    });

    const bucketFileService = new BucketFileService({
        repository: bucketFileRepository,
        caller: bucketFileCaller,
    });

    return [
        new BucketController({
            service: bucketService,
            bucketFileRepository,
            minio,
            bucketFileComponent,
            bucketFileEventCaller,
            logger,
        }),
        new BucketFileController({
            service: bucketFileService,
            bucketFileRepository,
            minio,
            logger,
        }),
        new RootController(),
    ];
}
