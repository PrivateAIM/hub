/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client, ExchangeOptions } from 'amqp-extension';
import { QueueRouterRoutingType } from './constants';
import { isMessageRouterPayload } from './helpers';
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
        let exchange : ExchangeOptions;
        if (message.metadata.routing.type === 'work') {
            exchange = {
                type: 'direct',
                name: message.metadata.routing.namespace || '',
                routingKey: message.metadata.routing.key,
            };
        } else {
            exchange = {
                type: 'topic',
                name: message.metadata.routing.namespace || 'FLAME',
                routingKey: message.metadata.routing.key,
            };
        }

        return this.driver.publish({
            content: message,
            exchange,
            persistent: message.metadata.persistent ??
                message.metadata.routing.type === QueueRouterRoutingType.WORK,
        });
    }

    consume(routing: QueueRouterRouting, handlers: QueueRouterHandlers) : Promise<void> {
        let exchange : ExchangeOptions;
        if (routing.type === 'work') {
            exchange = {
                type: 'direct',
                name: routing.namespace || '',
                routingKey: routing.key,
            };
        } else {
            exchange = {
                type: 'topic',
                name: routing.namespace,
                routingKey: routing.key,
            };
        }
        return this.driver.consume({
            exchange,
            prefetchCount: routing.type === QueueRouterRoutingType.WORK ? 1 : undefined,
            noAck: routing.type !== QueueRouterRoutingType.WORK,
            requeueOnFailure: routing.type === QueueRouterRoutingType.WORK,
        }, {
            $any: async (input) => {
                const payload = JSON.parse(input.content.toString('utf-8'));
                if (!isMessageRouterPayload(payload)) {
                    return;
                }

                let handler : QueueRouterHandler | undefined;

                if (
                    input.properties.type === 'string' &&
                    handlers[input.properties.type]
                ) {
                    handler = handlers[input.properties.type];
                } else {
                    handler = handlers.$any;
                }

                if (typeof handler !== 'function') {
                    return;
                }

                await handler(payload);
            },
        });
    }
}
