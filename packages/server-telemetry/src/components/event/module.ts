/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    BaseComponent, QueueRouterComponentEmitter, isQueueRouterUsable, useQueueRouter,
} from '@privateaim/server-kit';
import {
    EventCommand, EventEventQueueRouterRouting,
    EventTaskQueueRouterRouting,
} from '@privateaim/server-telemetry-kit';
import { EventComponentCleanerHandler, EventComponentCreateHandler } from './handlers';

export class EventComponent extends BaseComponent {
    constructor() {
        super();

        this.mount(EventCommand.CREATE, new EventComponentCreateHandler());
        this.mount(EventCommand.CLEAN, new EventComponentCleanerHandler());

        if (isQueueRouterUsable()) {
            this.mount('*', async (
                value,
                context,
            ) => {
                const emitter = new QueueRouterComponentEmitter();
                await emitter.emit(context.key, value, {
                    ...context.metadata,
                    routing: EventEventQueueRouterRouting,
                });
            });
        }
    }

    async start() {
        await this.initialize();

        if (isQueueRouterUsable()) {
            const queueRouter = useQueueRouter();

            await queueRouter.consumeAny(
                EventTaskQueueRouterRouting,
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
