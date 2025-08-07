/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ExchangeType } from 'amqp-extension';
import type { Client } from 'amqp-extension';
import { isLoggerUsable, useLogger } from '../../services';
import { QueueRouterRoutingType } from './constants';
import { isQueueRouterPayload } from './helpers';
import type {
    QueueRouterHandler,
    QueueRouterHandlers,
    QueueRouterPayload, QueueRouterRouting,
} from './types';

export class QueueRouter {
    protected driver : Client;

    //----------------------------------------------------------------

    constructor(driver: Client) {
        this.driver = driver;
    }

    //----------------------------------------------------------------

    publish(message: QueueRouterPayload) : Promise<boolean> {
        let exchange : Client;
        if (message.metadata.routing.type === 'work') {
            exchange = this.driver.of({
                type: ExchangeType.DIRECT,
                name: message.metadata.routing.namespace || '',
            });
        } else {
            exchange = this.driver.of({
                type: ExchangeType.TOPIC,
                name: message.metadata.routing.namespace || 'FLAME',
            });
        }

        if (isLoggerUsable()) {
            useLogger()
                .debug(`Publishing queue message ${message.type} in ${message.metadata.routing.key}`);
        }

        return exchange.publish(message.metadata.routing.key, message, {
            type: message.type,
            messageId: message.id,
            persistent: message.metadata.persistent ??
                message.metadata.routing.type === QueueRouterRoutingType.WORK,
        });
    }

    consumeAny(
        routing: QueueRouterRouting,
        fn: (payload: QueueRouterPayload) => Promise<void> | void,
    ) {
        return this.consume(routing, {
            $any: (payload) => fn(payload),
        });
    }

    consume(routing: QueueRouterRouting, handlers: QueueRouterHandlers) : Promise<void> {
        let exchange : Client;
        if (routing.type === 'work') {
            exchange = this.driver.of({
                type: ExchangeType.DIRECT,
                name: routing.namespace || '',
            });
        } else {
            exchange = this.driver.of({
                type: ExchangeType.TOPIC,
                name: routing.namespace || 'FLAME',
            });
        }

        return exchange.consume(routing.key, {
            prefetchCount: routing.type === QueueRouterRoutingType.WORK ? 1 : undefined,
            // noAck: routing.type !== QueueRouterRoutingType.WORK,
            requeueOnFailure: routing.type === QueueRouterRoutingType.WORK,
        }, {
            $any: async (input) => {
                const payload = JSON.parse(input.content.toString('utf-8'));
                if (!isQueueRouterPayload(payload)) {
                    return;
                }

                if (input.fields.redelivered) {
                    if (isLoggerUsable()) {
                        useLogger()
                            .debug(`Queue message ${input.properties.type} in ${routing.key} is not processed again.`);
                    }

                    return;
                }

                if (isLoggerUsable()) {
                    useLogger()
                        .debug(`Consuming queue message ${input.properties.type} in ${routing.key}`);
                }

                let handler : QueueRouterHandler | undefined;

                if (
                    typeof input.properties.type === 'string' &&
                    handlers[input.properties.type]
                ) {
                    handler = handlers[input.properties.type];
                } else {
                    handler = handlers.$any;
                }

                if (typeof handler !== 'function') {
                    if (isLoggerUsable()) {
                        useLogger()
                            .debug(`No queue handler to consume message ${input.properties.type} in ${routing.key}`);
                    }

                    return;
                }

                try {
                    await handler(payload);
                } catch (e) {
                    if (isLoggerUsable()) {
                        useLogger()
                            .error(e);
                    }

                    throw e;
                }
            },
        });
    }
}
