/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    BaseComponent, QueueRouterComponentEmitter, isQueueRouterUsable, useQueueRouter,
} from '@privateaim/server-kit';
import { LogCommand, LogTaskQueueRouterRouting } from '@privateaim/server-telemetry-kit';
import { LogComponentWriteHandler } from './handlers';

export class LogComponent extends BaseComponent {
    constructor() {
        super();

        this.mount(LogCommand.WRITE, new LogComponentWriteHandler());

        if (isQueueRouterUsable()) {
            this.on('*', async (type, payload) => {
                const [data, metadata] = payload;
                const emitter = new QueueRouterComponentEmitter();
                await emitter.emit(type, data, metadata);
            });
        }
    }

    async start() {
        await this.initialize();

        if (isQueueRouterUsable()) {
            const queueRouter = useQueueRouter();

            await queueRouter.consumeAny(
                LogTaskQueueRouterRouting,
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
}
