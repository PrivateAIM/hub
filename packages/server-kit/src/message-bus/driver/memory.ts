/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MessageBusPayload, MessageBusRouting } from '../types';
import type { IMessageBusDriver } from './types';

type MessageBusConsumer = {
    routing: MessageBusRouting,
    handler: (payload: MessageBusPayload) => Promise<void> | void,
};

export class MemoryMessageBusDriver implements IMessageBusDriver {
    protected consumers: MessageBusConsumer[] = [];

    async publish(routing: MessageBusRouting, message: MessageBusPayload): Promise<boolean> {
        const matching = this.consumers.filter(
            (consumer) => consumer.routing.key === routing.key &&
                consumer.routing.type === routing.type,
        );

        for (const consumer of matching) {
            await consumer.handler(message);
        }

        return matching.length > 0;
    }

    async consume(
        routing: MessageBusRouting,
        handler: (payload: MessageBusPayload) => Promise<void> | void,
    ): Promise<void> {
        this.consumers.push({ routing, handler });
    }
}
