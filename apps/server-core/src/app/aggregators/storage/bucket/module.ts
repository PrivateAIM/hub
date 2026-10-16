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
import { Component } from 'hubwire';
import type { StorageBucketAggregatorContext } from './types.ts';
import {
    StorageBucketClearingFinishedHandler,
    StorageBucketCreationFailedHandler,
    StorageBucketCreationFinishedHandler,
    StorageBucketDeletionFinishedHandler,
} from './handlers/index.ts';

export class StorageBucketAggregator extends Component<
    BucketComponentEventMap
> {
    constructor(ctx: StorageBucketAggregatorContext) {
        super();

        this.mount(BucketEvent.CREATION_FAILED, new StorageBucketCreationFailedHandler(ctx));
        this.mount(BucketEvent.CREATION_FINISHED, new StorageBucketCreationFinishedHandler(ctx));
        this.mount(BucketEvent.DELETION_FINISHED, new StorageBucketDeletionFinishedHandler(ctx));
        this.mount(BucketEvent.CLEARING_FINISHED, new StorageBucketClearingFinishedHandler(ctx));
    }

    async start() : Promise<void> {
        await this.initialize();
    }
}
