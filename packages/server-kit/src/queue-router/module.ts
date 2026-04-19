/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ExchangeType } from 'amqp-extension';
import type { Client } from 'amqp-extension';
import type { Logger } from '../logger';
import { QueueRouterRoutingType } from './constants';
import { isQueueRouterPayload } from './helpers';
import type {
    QueueRouterHandler,
    QueueRouterHandlers,
    QueueRouterPayload,
    QueueRouterPublishOptions,
    QueueRouterRouting,
} from './types';

type QueueRouterContext = {
    driver: Client,
    logger?: Logger,
};

export class QueueRouter {
    protected driver : Client;

    protected logger?: Logger;

    //----------------------------------------------------------------

    constructor(ctx: QueueRouterContext) {
        this.driver = ctx.driver;
        this.logger = ctx.logger;
    }

    //----------------------------------------------------------------

    publish(
        message: QueueRouterPayload,
        options: QueueRouterPublishOptions = {},
    ) : Promise<boolean> {
        options.logging ??= true;

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

        if (
            options.logging &&
            this.logger
        ) {
            this.logger
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
        return this.consume(routing, { $any: (payload) => fn(payload) });
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
                    if (this.logger) {
                        this.logger
                            .debug(`Queue message ${input.properties.type} in ${routing.key} is not processed again.`);
                    }

                    return;
                }

                if (this.logger) {
                    this.logger
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
                    if (this.logger) {
                        this.logger
                            .debug(`No queue handler to consume message ${input.properties.type} in ${routing.key}`);
                    }

                    return;
                }

                try {
                    await handler(payload);
                } catch (e) {
                    if (this.logger) {
                        this.logger
                            .error(e);
                    }

                    throw e;
                }
            },
        });
    }
}
