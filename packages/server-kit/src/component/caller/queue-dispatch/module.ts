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
import type { QueueDispatchComponentCallerOptions } from './types';

export class QueueDispatchComponentCaller<
    EventMap extends ComponentEventMap = ComponentEventMap,
> implements ComponentCaller<EventMap> {
    protected options : QueueDispatchComponentCallerOptions;

    protected messageBus?: MessageBus;

    protected logger?: Logger;

    constructor(options: QueueDispatchComponentCallerOptions) {
        this.options = options;
        this.messageBus = options.messageBus;
        this.logger = options.logger;
    }

    async call<K extends keyof EventMap>(
        type: K & string,
        ...payload: ComponentCallerPayload<EventMap[K]>
    ): Promise<void> {
        const [data, metadata] = payload;

        if (!this.messageBus) {
            if (this.logger) {
                this.logger.warn(`Can not publish ${type} event.`);
            }
            return;
        }

        await this.messageBus.publish(
            buildMessageBusPublishPayload({
                type,
                data,
                metadata: {
                    ...metadata,
                    routing: this.options.queue,
                },
            }),
            { logging: this.options.logging ?? true },
        );
    }
}
