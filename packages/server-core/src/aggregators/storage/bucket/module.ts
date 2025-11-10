/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/kit';
import {
    BucketEvent, BucketEventQueueRouterRouting,
} from '@privateaim/server-storage-kit';
import {
    BaseComponent,
    QueueRouterComponentEmitter,
    isQueueRouterUsable,
    useLogger,
    useQueueRouter,
} from '@privateaim/server-kit';
import { useEnv } from '../../../config';
import { StorageBucketCreationFinishedHandler, StorageBucketDeletionFinishedHandler } from './handlers';

export class StorageBucketAggregator extends BaseComponent {
    constructor() {
        super();

        this.mount(BucketEvent.CREATION_FINISHED, new StorageBucketCreationFinishedHandler());
        this.mount(BucketEvent.DELETION_FINISHED, new StorageBucketDeletionFinishedHandler());

        if (isQueueRouterUsable()) {
            this.on('*', async (type, payload) => {
                const [data, metadata] = payload;
                const emitter = new QueueRouterComponentEmitter();
                await emitter.emit(type, data, metadata);
            });
        }
    }

    async start() : Promise<void> {
        if (!isQueueRouterUsable()) {
            useLogger().warn('Storage bucket aggregator can not consume events.');
            return;
        }

        if (useEnv('env') === EnvironmentName.TEST) {
            useLogger().warn('Storage bucket aggregator is disabled in test environment.');
            return;
        }

        await this.initialize();

        const queueRouter = useQueueRouter();

        await queueRouter.consumeAny(
            BucketEventQueueRouterRouting,
            async (
                payload,
            ) => this.handle(
                payload.type,
                payload.data,
                payload.metadata,
            ),
        );
    }
}
