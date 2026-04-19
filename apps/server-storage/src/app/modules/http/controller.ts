/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import { LoggerInjectionKey } from '@privateaim/server-kit';
import { BucketController } from '../../../adapters/http/controllers/bucket/module.ts';
import { BucketFileController } from '../../../adapters/http/controllers/bucket-file/module.ts';
import { BucketComponent } from '../../components/bucket/module.ts';
import { BucketFileComponent } from '../../components/bucket-file/module.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { MinioClientInjectionKey } from '../minio/constants.ts';

export function createControllers(container: IContainer): Record<string, any>[] {
    const dataSource = container.resolve(DatabaseInjectionKey.DataSource);
    const minio = container.resolve(MinioClientInjectionKey);

    const loggerResult = container.tryResolve(LoggerInjectionKey);
    const logger = loggerResult.success ? loggerResult.data : undefined;

    const bucketComponent = new BucketComponent({ minio, logger });
    const bucketFileComponent = new BucketFileComponent({ minio, logger });

    return [
        new BucketController({
            dataSource,
            minio,
            bucketComponent,
            bucketFileComponent,
            logger,
        }),
        new BucketFileController({
            dataSource,
            minio,
            bucketFileComponent,
            logger,
        }),
    ];
}
