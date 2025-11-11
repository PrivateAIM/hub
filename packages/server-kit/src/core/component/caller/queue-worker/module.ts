/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { createNanoID } from '@privateaim/kit';
import type { Component, ComponentEventMap, ComponentHandleOptions } from '../../type';
import type { QueueRouter } from '../../../queue-router';
import { buildQueueRouterPublishPayload, useQueueRouter } from '../../../queue-router';
import type { ComponentCaller, ComponentCallerPayload, ComponentCallerResponse } from '../types';
import type { QueueSelfComponentCallerOptions } from './types';

export class QueueWorkerComponentCaller<
    EventMap extends ComponentEventMap = ComponentEventMap,
> implements ComponentCaller<EventMap> {
    protected component: Component<EventMap>;

    protected options: QueueSelfComponentCallerOptions;

    protected client : QueueRouter;

    constructor(component: Component<EventMap>, options: QueueSelfComponentCallerOptions) {
        this.component = component;
        this.options = options;

        this.client = useQueueRouter();
    }

    async start() {
        await this.client.consumeAny(
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
    ): Promise<ComponentCallerResponse<EventMap>> {
        const [data, metadata] = payload;
        if (!this.component.handle) {
            throw new Error(`Component ${this.component.constructor.name} can not be called.`);
        }

        metadata.correlationId = metadata.correlationId || createNanoID();

        const options : ComponentHandleOptions<EventMap> = {
            handle: async (
                childValue,
                childContext,
            ) => {
                /**
                 * publish unhandled requests to publish queue.
                 */
                await this.client.publish(buildQueueRouterPublishPayload({
                    type: childContext.key,
                    data: childValue,
                    metadata: {
                        routing: this.options.publishRouting,
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
