/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '../../../logger';
import type { MessageBus } from '../../../message-bus';
import { buildMessageBusPublishPayload } from '../../../message-bus';
import type { Component, ComponentEventMap, ComponentHandleOptions } from '../../type';
import type { ComponentCaller, ComponentCallerPayload } from '../types';
import type { MessageBusWorkerComponentCallerOptions } from './types';

export class MessageBusWorkerComponentCaller<
    EventMap extends ComponentEventMap = ComponentEventMap,
> implements ComponentCaller<EventMap>, Component<EventMap> {
    protected component: Component<EventMap>;

    protected options: MessageBusWorkerComponentCallerOptions;

    protected messageBus?: MessageBus;

    protected logger?: Logger;

    constructor(component: Component<EventMap>, options: MessageBusWorkerComponentCallerOptions) {
        this.component = component;
        this.options = options;
        this.messageBus = options.messageBus;
        this.logger = options.logger;
    }

    async start() {
        await this.component.start();

        if (!this.messageBus) {
            if (this.logger) {
                this.logger.warn(`Can not consume queue for component ${this.component.constructor.name}`);
            }
            return;
        }

        await this.messageBus.consumeAny(
            this.options.consumeRouting,
            async (payload) => {
                await this.call(payload.type, payload.data, payload.metadata);
            },
        );
    }

    /**
     * Call a specific handler and collect all unhandled events.
     *
     * @param key
     * @param payload
     */
    async call<Key extends keyof EventMap>(
        key: Key & string,
        ...payload: ComponentCallerPayload<EventMap[Key]>
    ): Promise<void> {
        const [data, metadata] = payload;
        if (!this.component.handle) {
            throw new Error(`Component ${this.component.constructor.name} can not be called.`);
        }

        if (!this.messageBus) {
            throw new Error(`MessageBus is not available for component ${this.component.constructor.name}.`);
        }

        const { messageBus } = this;
        const options : ComponentHandleOptions<EventMap> = {
            handle: async (
                childValue,
                childContext,
            ) => {
                if (this.options.publishRouting) {
                    /**
                     *
                     * publish unhandled requests to publish routing.
                     */
                    await messageBus.publish(buildMessageBusPublishPayload({
                        type: childContext.key,
                        data: childValue,
                        metadata: {
                            ...(metadata || {}),
                            ...childContext.metadata,
                            routing: this.options.publishRouting,
                        },
                    }));
                } else if (this.logger) {
                    this.logger.warn(
                        `Component ${this.component.constructor.name} event ${childContext.key} could not be handled.`,
                    );
                }
            },
        };

        await this.component.handle(
            key,
            data,
            metadata,
            options,
        );
    }
}
