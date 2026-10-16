/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '../../../logger';
import type { MessageBus } from '../../../message-bus';
import { buildMessageBusPublishPayload } from '../../../message-bus';
import type { ComponentEventMap } from '../../type';
import type { ComponentCaller, ComponentCallerPayload } from '../types';
import type { MessageBusDispatchComponentCallerOptions } from './types';

export class MessageBusDispatchComponentCaller<
    EventMap extends ComponentEventMap = ComponentEventMap,
> implements ComponentCaller<EventMap> {
    protected options : MessageBusDispatchComponentCallerOptions;

    protected messageBus?: MessageBus;

    protected logger?: Logger;

    constructor(options: MessageBusDispatchComponentCallerOptions) {
        this.options = options;
        this.messageBus = options.messageBus;
        this.logger = options.logger;
    }

    async call<K extends keyof EventMap>(
        type: K & string,
        ...payload: ComponentCallerPayload<EventMap[K]>
    ): Promise<void> {
        await this.dispatch(type, ...payload);
    }

    /**
     * Like call(), but resolves whether the bus accepted the message: false
     * when there is no bus or no consumer took it (memory driver), so a caller
     * that must not lose a command can run it another way.
     */
    async dispatch<K extends keyof EventMap>(
        type: K & string,
        ...payload: ComponentCallerPayload<EventMap[K]>
    ): Promise<boolean> {
        const [data, metadata] = payload;

        if (!this.messageBus) {
            if (this.logger) {
                this.logger.warn(`Can not publish ${type} event.`);
            }
            return false;
        }

        const published = await this.messageBus.publish(
            buildMessageBusPublishPayload({
                type,
                data,
                metadata: {
                    ...metadata,
                    routing: this.options.routing,
                },
            }),
            { logging: this.options.logging ?? true },
        );

        if (!published && this.logger) {
            this.logger.warn(`Message ${type} in ${this.options.routing.key} was not delivered to any consumer.`);
        }

        return published;
    }
}
