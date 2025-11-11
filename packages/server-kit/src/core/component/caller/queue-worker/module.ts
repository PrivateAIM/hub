/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { createNanoID } from '@privateaim/kit';
import type { Component, ComponentEventMap, ComponentHandleOptions } from '../../type';
import { buildQueueRouterPublishPayload, isQueueRouterUsable, useQueueRouter } from '../../../queue-router';
import type { ComponentCaller, ComponentCallerPayload, ComponentCallerResponse } from '../types';
import type { QueueSelfComponentCallerOptions } from './types';
import { useLogger } from '../../../../services';

export class QueueWorkerComponentCaller<
    EventMap extends ComponentEventMap = ComponentEventMap,
> implements ComponentCaller<EventMap>, Component<EventMap> {
    protected component: Component<EventMap>;

    protected options: QueueSelfComponentCallerOptions;

    constructor(component: Component<EventMap>, options: QueueSelfComponentCallerOptions) {
        this.component = component;
        this.options = options;
    }

    async start() {
        if (!isQueueRouterUsable()) {
            useLogger().warn(`Can not consume queue for component ${this.component.constructor.name}`);
            return;
        }

        const client = useQueueRouter();
        await client.consumeAny(
            this.options.consumeQueue,
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
    ): Promise<ComponentCallerResponse<EventMap>> {
        const [data, metadata] = payload;
        if (!this.component.handle) {
            throw new Error(`Component ${this.component.constructor.name} can not be called.`);
        }

        metadata.correlationId = metadata.correlationId || createNanoID();

        const client = useQueueRouter();
        const options : ComponentHandleOptions<EventMap> = {
            handle: async (
                childValue,
                childContext,
            ) => {
                if (!this.options.publishQueue) {
                    throw new Error(
                        `Component ${this.component.constructor.name} event ${childContext.key} could not be handled.`,
                    );
                }
                /**
                 *
                 * publish unhandled requests to publish queue.
                 */
                await client.publish(buildQueueRouterPublishPayload({
                    type: childContext.key,
                    data: childValue,
                    metadata: {
                        routing: this.options.publishQueue,
                        ...childContext.metadata,
                    },
                }));
            },
        };

        await this.component.handle(
            key,
            data,
            metadata,
            options,
        );

        return {};
    }
}
