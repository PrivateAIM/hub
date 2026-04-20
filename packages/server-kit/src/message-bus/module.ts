/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '../logger';
import type { IMessageBusDriver } from './driver/types';
import type {
    MessageBusHandler,
    MessageBusHandlers,
    MessageBusPayload,
    MessageBusPublishOptions,
    MessageBusRouting,
} from './types';

type MessageBusContext = {
    driver: IMessageBusDriver,
    logger?: Logger,
};

export class MessageBus {
    protected driver : IMessageBusDriver;

    protected logger?: Logger;

    //----------------------------------------------------------------

    constructor(ctx: MessageBusContext) {
        this.driver = ctx.driver;
        this.logger = ctx.logger;
    }

    //----------------------------------------------------------------

    publish(
        message: MessageBusPayload,
        options: MessageBusPublishOptions = {},
    ) : Promise<boolean> {
        options.logging ??= true;

        if (
            options.logging &&
            this.logger
        ) {
            this.logger
                .debug(`Publishing queue message ${message.type} in ${message.metadata.routing.key}`);
        }

        return this.driver.publish(message.metadata.routing, message);
    }

    consumeAny(
        routing: MessageBusRouting,
        fn: (payload: MessageBusPayload) => Promise<void> | void,
    ) {
        return this.consume(routing, { $any: (payload) => fn(payload) });
    }

    consume(routing: MessageBusRouting, handlers: MessageBusHandlers) : Promise<void> {
        return this.driver.consume(routing, async (payload) => {
            if (this.logger) {
                this.logger
                    .debug(`Consuming queue message ${payload.type} in ${routing.key}`);
            }

            let handler : MessageBusHandler | undefined;

            if (
                typeof payload.type === 'string' &&
                handlers[payload.type]
            ) {
                handler = handlers[payload.type];
            } else {
                handler = handlers.$any;
            }

            if (typeof handler !== 'function') {
                if (this.logger) {
                    this.logger
                        .debug(`No queue handler to consume message ${payload.type} in ${routing.key}`);
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
        });
    }
}
