/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { DataSource } from 'typeorm';
import { BucketRepositoryAdapter } from './repositories/bucket/repository.ts';
import { BucketFileRepositoryAdapter } from './repositories/bucket-file/repository.ts';
import { DatabaseInjectionKey } from './constants.ts';

export function registerRepositories(container: IContainer, dataSource: DataSource): void {
    container.register(DatabaseInjectionKey.BucketRepository, { useValue: new BucketRepositoryAdapter(dataSource) });
    container.register(DatabaseInjectionKey.BucketFileRepository, { useValue: new BucketFileRepositoryAdapter(dataSource) });
}
