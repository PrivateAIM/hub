/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ICallable, IDispatcher } from 'hubwire';
import { LocalDispatcher, RemoteDispatcher } from 'hubwire';
import type { IRegistryDispatcher } from '../../../../core/harbor/types.ts';
import type { RegistryEventMap } from '../type.ts';
import { RegistryCommand, RegistryTaskMessageBusRouting } from '../constants.ts';
import type { RegistryComponentDispatcherContext } from './types.ts';

function isRegistryCommand(input: string): input is RegistryCommand {
    return Object.values<string>(RegistryCommand).includes(input);
}

/**
 * With a message bus, a registry command is only dispatched: the registry
 * consumer started by `ComponentsModule` runs it, and retries a command that
 * throws (the Harbor handlers log and swallow Harbor errors instead). The
 * queue is not ordered: two commands for one project must be one command
 * (PROJECT_RELINK). A work queue keeps a command until a consumer takes it
 * (the memory driver too), so one published before the registry consumer
 * started is never lost. Without a bus the component is called in-process;
 * a failing direct call is not re-queued.
 */
export class RegistryComponentDispatcher implements IRegistryDispatcher {
    protected dispatcher: IDispatcher<RegistryEventMap>;

    constructor(component: ICallable<RegistryEventMap>, ctx: RegistryComponentDispatcherContext = {}) {
        this.dispatcher = ctx.messageBus ?
            new RemoteDispatcher({ messageBus: ctx.messageBus, routing: RegistryTaskMessageBusRouting }) :
            new LocalDispatcher(component);
    }

    async dispatch(command: string, data: Record<string, any>, meta: Record<string, any>): Promise<void> {
        // an unknown command has no handler: the component would ignore it as well
        if (isRegistryCommand(command)) {
            await this.dispatcher.dispatch(command, data, meta);
        }
    }
}
