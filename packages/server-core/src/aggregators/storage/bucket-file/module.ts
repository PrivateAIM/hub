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
} from '@privateaim/server-kit';
import { StorageBucketFileCreationFinishedHandler, StorageBucketFileDeletionFinishedHandler } from './handlers/index.ts';

export class StorageBucketFileAggregator extends BaseComponent<
BucketFileComponentEventMap
> {
    constructor() {
        super();

        this.mount(BucketFileEvent.CREATION_FINISHED, new StorageBucketFileCreationFinishedHandler());
        this.mount(BucketFileEvent.DELETION_FINISHED, new StorageBucketFileDeletionFinishedHandler());
    }

    async start() : Promise<void> {
        await this.initialize();
    }
}
