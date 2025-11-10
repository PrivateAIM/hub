/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import {
    BaseComponent,
    QueueRouterComponentEmitter,
    isQueueRouterUsable,
    useLogger, useQueueRouter,
} from '@privateaim/server-kit';
import type {
    BucketComponentEventMap,
    BucketCreateCommandPayload,
    BucketDeleteCommandPayload,
} from '@privateaim/server-storage-kit';
import {
    BucketCommand,

    BucketEventQueueRouterRouting,
    BucketTaskQueueRouterRouting,
} from '@privateaim/server-storage-kit';
import { BucketCreateHandler, BucketDeleteHandler } from './handlers';

export class BucketComponent extends BaseComponent<BucketComponentEventMap> {
    constructor() {
        super();

        this.mount(BucketCommand.CREATE, new BucketCreateHandler());
        this.mount(BucketCommand.DELETE, new BucketDeleteHandler());

        if (isQueueRouterUsable()) {
            this.mount('*', async (
                value,
                context,
            ) => {
                const emitter = new QueueRouterComponentEmitter();
                await emitter.emit(context.key, value, {
                    ...context.metadata,
                    routing: BucketEventQueueRouterRouting,
                });
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
                    payload.type as keyof BucketComponentEventMap,
                    payload.data,
                    payload.metadata,
                ),
            );
        } else {
            useLogger().warn('Storage bucket component can not consume tasks.');
        }
    }

    async executeCreate(payload: BucketCreateCommandPayload) {
        return this.handle(BucketCommand.CREATE, payload, {});
    }

    async executeDelete(payload: BucketDeleteCommandPayload) {
        return this.handle(BucketCommand.DELETE, payload, {});
    }
}
