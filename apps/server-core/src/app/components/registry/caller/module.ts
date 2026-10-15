/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { Component, ComponentCaller, MessageBus } from '@privateaim/server-kit';
import {
    DirectComponentCaller,
    MessageBusDispatchComponentCaller,
} from '@privateaim/server-kit';
import type { IRegistryCaller } from '../../../../core/harbor/types.ts';
import type { RegistryEventMap } from '../type.ts';
import { RegistryTaskMessageBusRouting } from '../constants.ts';

/**
 * With a message bus, a registry command is only dispatched: the registry
 * consumer started by `ComponentsModule` runs it, with the bus's retry and
 * backoff. The component is called in-process only when there is no bus.
 * Never both — a direct call that fell back to the queue on failure turned the
 * queue into an accidental one-shot retry.
 */
export class RegistryComponentCaller implements IRegistryCaller {
    protected caller: ComponentCaller;

    constructor(component: Component<RegistryEventMap>, ctx?: { messageBus?: MessageBus }) {
        this.caller = ctx?.messageBus ?
            new MessageBusDispatchComponentCaller({
                routing: RegistryTaskMessageBusRouting,
                messageBus: ctx.messageBus,
            }) :
            new DirectComponentCaller(component);
    }

    async call(command: string, data: Record<string, any>, meta: Record<string, any>): Promise<void> {
        await this.caller.call(command, data, meta);
    }
}
