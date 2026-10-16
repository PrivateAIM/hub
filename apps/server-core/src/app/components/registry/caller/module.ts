/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { IComponent, IMessageBus } from 'synergos';
import { DirectCaller, buildMessage, invokeHook } from 'synergos';
import type { IRegistryCaller } from '../../../../core/harbor/types.ts';
import type { RegistryEventMap } from '../type.ts';
import { RegistryCommand, RegistryTaskMessageBusRouting } from '../constants.ts';
import type { RegistryComponentCallerContext } from './types.ts';

function isRegistryCommand(input: string): input is RegistryCommand {
    return Object.values<string>(RegistryCommand).includes(input);
}

/**
 * With a message bus, a registry command is only dispatched: the registry
 * consumer started by `ComponentsModule` runs it, and retries a command that
 * throws (the Harbor handlers log and swallow Harbor errors instead). The
 * queue is not ordered: two commands for one project must be one command
 * (PROJECT_RELINK). The component is called in-process when there is no bus,
 * or when the bus accepted no consumer for the command (memory driver before
 * the registry consumer is started) — it is never lost. A failing direct call
 * is not re-queued: that turned the queue into an accidental one-shot retry.
 *
 * Publishes itself instead of using synergos' DispatchCaller, whose call()
 * does not report whether the bus accepted the message; the message is built
 * the same way (buildMessage, the command's metadata plus the routing).
 */
export class RegistryComponentCaller implements IRegistryCaller {
    protected direct: DirectCaller<RegistryEventMap>;

    protected messageBus?: IMessageBus;

    protected context: RegistryComponentCallerContext;

    constructor(component: IComponent<RegistryEventMap>, ctx: RegistryComponentCallerContext = {}) {
        this.direct = new DirectCaller(component);
        this.messageBus = ctx.messageBus;
        this.context = ctx;
    }

    async call(command: string, data: Record<string, any>, meta: Record<string, any>): Promise<void> {
        if (this.messageBus) {
            const message = buildMessage({
                type: command,
                data,
                metadata: { ...meta, routing: RegistryTaskMessageBusRouting },
            });

            if (await this.messageBus.publish(message)) {
                return;
            }

            invokeHook(this.context.hooks, 'onUndelivered', message);
        }

        // an unknown command has no handler: the component would ignore it as well
        if (isRegistryCommand(command)) {
            await this.direct.call(command, data, meta);
        }
    }
}
