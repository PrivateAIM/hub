/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ComponentCallerPayload, IComponentCaller, MessageBus } from 'ergos';
import { DirectComponentCaller, MessageBusDispatchComponentCaller } from 'ergos';
import type { RegistryEventMap } from '../type.ts';
import { RegistryTaskMessageBusRouting } from '../constants.ts';
import type { RegistryComponent } from '../module.ts';

/**
 * ponytail: keeps the former CompoundComponentCaller semantics (in-process
 * first, the queue as fallback, errors swallowed) until F17 makes it
 * queue-only; ergos dropped the compound caller.
 */
export class RegistryComponentCaller implements IComponentCaller<RegistryEventMap> {
    protected callers: IComponentCaller<RegistryEventMap>[];

    constructor(component: RegistryComponent, ctx?: { messageBus?: MessageBus }) {
        this.callers = [
            new DirectComponentCaller<RegistryEventMap>(component),
            new MessageBusDispatchComponentCaller<RegistryEventMap>({
                routing: RegistryTaskMessageBusRouting,
                messageBus: ctx?.messageBus,
            }),
        ];
    }

    async call<K extends keyof RegistryEventMap & string>(
        key: K,
        ...payload: ComponentCallerPayload<RegistryEventMap[K]>
    ): Promise<void> {
        for (const caller of this.callers) {
            try {
                await caller.call(key, ...payload);
                return;
            } catch {
                // continue
            }
        }

        throw new Error('No caller could call component.');
    }
}
