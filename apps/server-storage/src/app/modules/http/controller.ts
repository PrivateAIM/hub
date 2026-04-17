/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import { BucketController } from '../../../adapters/http/controllers/bucket/module.ts';
import { BucketFileController } from '../../../adapters/http/controllers/bucket-file/module.ts';
import { BucketComponent } from '../../components/bucket/module.ts';
import { BucketFileComponent } from '../../components/bucket-file/module.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { MinioClientInjectionKey } from '../minio/constants.ts';

export function createControllers(container: IContainer): Record<string, any>[] {
    const dataSource = container.resolve(DatabaseInjectionKey.DataSource);
    const minio = container.resolve(MinioClientInjectionKey);

    const bucketComponent = new BucketComponent({ minio });
    const bucketFileComponent = new BucketFileComponent({ minio });

    return [
        new BucketController({
            dataSource,
            minio,
            bucketComponent,
            bucketFileComponent,
        }),
        new BucketFileController({
            dataSource,
            minio,
            bucketFileComponent,
        }),
    ];
}
