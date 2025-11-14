/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteral } from '../../../../type';
import type { ComponentEventMap } from '../../type';
import type { ComponentCaller, ComponentCallerPayload, ComponentCallerResponse } from '../types';

export class CompoundComponentCaller<
    EventMap extends ComponentEventMap = ComponentEventMap,
    Metadata extends ObjectLiteral = ObjectLiteral,
> implements ComponentCaller<EventMap, Metadata> {
    protected callers : ComponentCaller<EventMap, Metadata>[];

    constructor(callers: ComponentCaller<EventMap, Metadata>[]) {
        this.callers = callers;
    }

    async call<Key extends keyof ComponentEventMap>(
        key: Key & string,
        ...payload: ComponentCallerPayload<ComponentEventMap[Key], Metadata>
    ): Promise<ComponentCallerResponse<ComponentEventMap>> {
        const [data, metadata] = payload;

        for (let i = 0; i < this.callers.length; i++) {
            const caller = this.callers[i];

            try {
                return await caller.call(key, data, metadata);
            } catch (e) {
                // continue;
            }
        }

        throw new Error('No caller could call component.');
    }
}
