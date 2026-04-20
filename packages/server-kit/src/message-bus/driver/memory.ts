/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MessageBusRoutingType } from '../constants';
import type { MessageBusPayload, MessageBusRouting } from '../types';
import type { IMessageBusDriver } from './types';

type MessageBusConsumer = {
    routing: MessageBusRouting,
    handler: (payload: MessageBusPayload) => Promise<void> | void,
};

export class MemoryMessageBusDriver implements IMessageBusDriver {
    protected consumers: MessageBusConsumer[] = [];

    protected workIndex: number = 0;

    async publish(routing: MessageBusRouting, message: MessageBusPayload): Promise<boolean> {
        const matching = this.consumers.filter(
            (consumer) => consumer.routing.key === routing.key &&
                consumer.routing.type === routing.type,
        );

        if (matching.length === 0) {
            return false;
        }

        if (routing.type === MessageBusRoutingType.WORK) {
            const index = this.workIndex % matching.length;
            this.workIndex++;
            await matching[index].handler(message);

            return true;
        }

        for (const consumer of matching) {
            await consumer.handler(message);
        }

        return true;
    }

    async consume(
        routing: MessageBusRouting,
        handler: (payload: MessageBusPayload) => Promise<void> | void,
    ): Promise<void> {
        this.consumers.push({ routing, handler });
    }
}
