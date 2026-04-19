/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    type BucketComponentEventMap,
    BucketEvent,
} from '@privateaim/server-storage-kit';
import {
    BaseComponent,
} from '@privateaim/server-kit';
import type { BaseAggregatorHandlerContext } from '../../base.ts';
import { StorageBucketCreationFinishedHandler, StorageBucketDeletionFinishedHandler } from './handlers/index.ts';

export class StorageBucketAggregator extends BaseComponent<
    BucketComponentEventMap
> {
    constructor(ctx: BaseAggregatorHandlerContext) {
        super();

        this.mount(BucketEvent.CREATION_FINISHED, new StorageBucketCreationFinishedHandler(ctx));
        this.mount(BucketEvent.DELETION_FINISHED, new StorageBucketDeletionFinishedHandler(ctx));
    }

    async start() : Promise<void> {
        await this.initialize();
    }
}
