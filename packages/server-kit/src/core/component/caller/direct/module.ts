/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { createNanoID } from '@privateaim/kit';
import type { ComponentCaller, ComponentCallerPayload } from '../types';
import type { Component, ComponentEventMap, ComponentHandleOptions } from '../../type';
import type { ComponentDirectCallerResponse } from './types';

export class DirectComponentCaller<
    EventMap extends ComponentEventMap = ComponentEventMap,
> implements ComponentCaller<EventMap> {
    protected component: Component<EventMap>;

    constructor(component : Component<EventMap>) {
        this.component = component;
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

        await this.callWithResponse(key, data, metadata);
    }

    /**
     * Call a specific handler and collect all unhandled events.
     *
     * @param key
     * @param payload
     */
    async callWithResponse<Key extends keyof EventMap>(
        key: Key & string,
        ...payload: ComponentCallerPayload<EventMap[Key]>
    ): Promise<ComponentDirectCallerResponse<EventMap>> {
        const [data, metadata] = payload;
        if (!this.component.handle) {
            throw new Error(`Component ${this.component.constructor.name} can not be called.`);
        }

        metadata.correlationId = metadata.correlationId || createNanoID();

        const events : ComponentDirectCallerResponse<EventMap> = {};

        const options : ComponentHandleOptions<EventMap> = {
            handle: (childValue, childContext) => {
                events[childContext.key] = childValue;
            },
        };

        await this.component.handle(
            key,
            data,
            metadata,
            options,
        );

        return events;
    }
}
