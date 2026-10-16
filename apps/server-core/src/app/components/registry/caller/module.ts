/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type {
    Component,
    ComponentCaller,
    Logger,
    MessageBus,
} from '@privateaim/server-kit';
import {
    DirectComponentCaller,
    MessageBusDispatchComponentCaller,
} from '@privateaim/server-kit';
import type { IRegistryCaller } from '../../../../core/harbor/types.ts';
import type { RegistryEventMap } from '../type.ts';
import { RegistryTaskMessageBusRouting } from '../constants.ts';

/**
 * With a message bus, a registry command is only dispatched: the registry
 * consumer started by `ComponentsModule` runs it, and retries a command that
 * throws (the Harbor handlers log and swallow Harbor errors instead). The
 * queue is not ordered: two commands for one project must be one command
 * (PROJECT_RELINK). The component is called in-process when there is no bus,
 * or when the bus accepted no consumer for the command (memory driver before
 * the registry consumer is started) — it is never lost. A failing direct call
 * is not re-queued: that turned the queue into an accidental one-shot retry.
 */
export class RegistryComponentCaller implements IRegistryCaller {
    protected direct: ComponentCaller;

    protected dispatcher?: MessageBusDispatchComponentCaller;

    constructor(component: Component<RegistryEventMap>, ctx?: { messageBus?: MessageBus, logger?: Logger }) {
        this.direct = new DirectComponentCaller(component);
        if (ctx?.messageBus) {
            this.dispatcher = new MessageBusDispatchComponentCaller({
                routing: RegistryTaskMessageBusRouting,
                messageBus: ctx.messageBus,
                logger: ctx.logger,
            });
        }
    }

    async call(command: string, data: Record<string, any>, meta: Record<string, any>): Promise<void> {
        if (this.dispatcher && await this.dispatcher.dispatch(command, data, meta)) {
            return;
        }

        await this.direct.call(command, data, meta);
    }
}
