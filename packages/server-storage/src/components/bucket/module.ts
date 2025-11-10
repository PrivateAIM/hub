/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata } from '@privateaim/server-kit';
import {
    BaseComponent,
    buildQueueRouterPublishPayload,
    isQueueRouterUsable,
    useLogger, useQueueRouter,
} from '@privateaim/server-kit';
import type {
    BucketCreateCommandPayload,
    BucketCreationFailedEventPayload,
    BucketCreationFinishedEventPayload,
    BucketDeleteCommandPayload,
    BucketDeletionFailedEventPayload,
    BucketDeletionFinishedEventPayload,
    BucketEvent,
} from '@privateaim/server-storage-kit';
import {
    BucketCommand,
    BucketTaskQueueRouterRouting,
} from '@privateaim/server-storage-kit';
import { BucketCreateHandler, BucketDeleteHandler } from './handlers';

export class BucketComponent extends BaseComponent<{
    [BucketEvent.CREATION_FAILED]: [BucketCreationFailedEventPayload, ComponentMetadata],
    [BucketEvent.CREATION_FINISHED]: [BucketCreationFinishedEventPayload, ComponentMetadata],

    [BucketEvent.DELETION_FAILED]: [BucketDeletionFailedEventPayload, ComponentMetadata],
    [BucketEvent.DELETION_FINISHED]: [BucketDeletionFinishedEventPayload, ComponentMetadata],
}> {
    constructor() {
        super();

        this.mount(BucketCommand.CREATE, new BucketCreateHandler());
        this.mount(BucketCommand.DELETE, new BucketDeleteHandler());

        if (isQueueRouterUsable()) {
            this.on('*', async (type, value) => {
                const [data, metadata] = value;
                const payload = buildQueueRouterPublishPayload({
                    type,
                    data,
                    metadata,
                });

                const queueRouter = useQueueRouter();
                await queueRouter.publish(payload);
            });
        }
    }

    async start() {
        await this.initialize();

        if (isQueueRouterUsable()) {
            const queueRouter = useQueueRouter();

            await queueRouter.consumeAny(
                BucketTaskQueueRouterRouting,
                async (
                    payload,
                ) => this.handle(
                    payload.type,
                    payload.data,
                    payload.metadata,
                ),
            );
        } else {
            useLogger().warn('Storage bucket component can not consume tasks.');
        }
    }

    async executeCreate(payload: BucketCreateCommandPayload) {
        return this.handle(BucketCommand.CREATE, payload);
    }

    async executeDelete(payload: BucketDeleteCommandPayload) {
        return this.handle(BucketCommand.DELETE, payload);
    }
}
