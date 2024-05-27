/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client } from 'amqp-extension';
import { isMessageRouterPayload } from '../helpers';
import type { QueueRouterHandler, QueueRouterHandlers, QueueRouterPayload } from '../types';
import type { QueueRouterStrategy } from './types';

export class QueueRouterEventStrategy implements QueueRouterStrategy {
    protected driver : Client;

    //----------------------------------------------------------------

    constructor(driver: Client) {
        this.driver = driver;
    }

    publish(to: string, message: QueueRouterPayload): Promise<boolean> {
        return this.driver.publish({
            content: message,
            exchange: {
                type: 'topic',
                name: 'FLAME',
                routingKey: to,
            },
            persistent: true,
        });
    }

    consume(from: string, handlers: QueueRouterHandlers): Promise<void> {
        return this.driver.consume({
            exchange: {
                type: 'topic',
                name: 'FLAME',
                routingKey: from,
            },
            noAck: false,
            requeueOnFailure: false,
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
