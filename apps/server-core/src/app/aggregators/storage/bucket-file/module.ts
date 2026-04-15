/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    type BucketFileComponentEventMap,
    BucketFileEvent,
} from '@privateaim/server-storage-kit';
import {
    BaseComponent,
    type TaskManager,
} from '@privateaim/server-kit';
import type { DataSource } from 'typeorm';
import type { TaskMap } from '../../../../core/domains/index.ts';
import { StorageBucketFileCreationFinishedHandler, StorageBucketFileDeletionFinishedHandler } from './handlers/index.ts';

export class StorageBucketFileAggregator extends BaseComponent<
    BucketFileComponentEventMap
> {
    constructor(ctx: { dataSource: DataSource; taskManager: TaskManager<TaskMap> }) {
        super();

        this.mount(BucketFileEvent.CREATION_FINISHED, new StorageBucketFileCreationFinishedHandler(ctx));
        this.mount(BucketFileEvent.DELETION_FINISHED, new StorageBucketFileDeletionFinishedHandler(ctx));
    }

    async start() : Promise<void> {
        await this.initialize();
    }
}
