/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { DataSource } from 'typeorm';
import type { IBucketFileRepository, IBucketRepository } from '../../../core/entities/index.ts';

export const DatabaseInjectionKey = {
    DataSource: new TypedToken<DataSource>('DataSource'),
    BucketRepository: new TypedToken<IBucketRepository>('BucketRepository'),
    BucketFileRepository: new TypedToken<IBucketFileRepository>('BucketFileRepository'),
};
