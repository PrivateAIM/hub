/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client, ExchangeType } from 'amqp-extension';
import type { Logger } from '../../logger';
import { MessageBusRoutingType } from '../constants';
import { isMessageBusPayload } from '../helpers';
import type { MessageBusPayload, MessageBusRouting } from '../types';
import type { IMessageBusDriver } from './types';

export type AmqpMessageBusDriverOptions = {
    connectionString: string,
    logger?: Logger,
};

export class AmqpMessageBusDriver implements IMessageBusDriver {
    protected client: Client;

    protected logger?: Logger;

    constructor(options: AmqpMessageBusDriverOptions) {
        this.client = new Client({ connectionOptions: options.connectionString });
        this.logger = options.logger;
    }

    async publish(routing: MessageBusRouting, message: MessageBusPayload): Promise<boolean> {
        const exchange = this.resolveExchange(routing);

        return exchange.publish(routing.key, message, {
            type: message.type,
            messageId: message.id,
            persistent: message.metadata.persistent ??
                routing.type === MessageBusRoutingType.WORK,
        });
    }

    async consume(
        routing: MessageBusRouting,
        handler: (payload: MessageBusPayload) => Promise<void> | void,
    ): Promise<void> {
        const exchange = this.resolveExchange(routing);

        return exchange.consume(routing.key, {
            prefetchCount: routing.type === MessageBusRoutingType.WORK ? 1 : undefined,
            requeueOnFailure: routing.type === MessageBusRoutingType.WORK,
        }, {
            $any: async (input) => {
                const payload = JSON.parse(input.content.toString('utf-8'));
                if (!isMessageBusPayload(payload)) {
                    return;
                }

                if (input.fields.redelivered) {
                    if (this.logger) {
                        this.logger
                            .debug(`Queue message ${input.properties.type} in ${routing.key} is not processed again.`);
                    }

                    return;
                }

                await handler(payload);
            },
        });
    }

    private resolveExchange(routing: MessageBusRouting): Client {
        if (routing.type === MessageBusRoutingType.WORK) {
            return this.client.of({
                type: ExchangeType.DIRECT,
                name: routing.namespace || '',
            });
        }

        return this.client.of({
            type: ExchangeType.TOPIC,
            name: routing.namespace || 'FLAME',
        });
    }
}
