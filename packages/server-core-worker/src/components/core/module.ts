/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    CoreCommand,
    CoreTaskQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import type { CoreConfigurePayload, CoreDestroyPayload } from '@privateaim/server-core-worker-kit';
import type { Component, QueueRouterHandlers } from '@privateaim/server-kit';
import { isQueueRouterUsable, useLogger, useQueueRouter } from '@privateaim/server-kit';
import { EnvironmentName, useEnv } from '../../config';
import {
    executeCoreConfigureCommand, executeCoreDestroyCommand,

} from './commands';
import {
    writeConfiguredEvent,
    writeConfiguringEvent,
    writeDestroyedEvent,
    writeDestroyingEvent,
    writeFailedEvent,
} from './queue';

function createHandlers() : QueueRouterHandlers<{
    [CoreCommand.CONFIGURE]: CoreConfigurePayload,
    [CoreCommand.DESTROY]: CoreDestroyPayload
}> {
    return {
        [CoreCommand.CONFIGURE]: async (message) => {
            await Promise.resolve(message.data)
                .then((data) => writeConfiguringEvent(data))
                .then(executeCoreConfigureCommand)
                .then((data) => writeConfiguredEvent(data))
                .catch((err: Error) => writeFailedEvent({
                    data: message.data,
                    command: CoreCommand.CONFIGURE,
                    error: err,
                }));
        },
        [CoreCommand.DESTROY]: async (message) => {
            await Promise.resolve(message.data)
                .then((data) => writeDestroyingEvent(data))
                .then(executeCoreDestroyCommand)
                .then((data) => writeDestroyedEvent(data))
                .catch((err: Error) => writeFailedEvent({
                    data: message.data,
                    command: CoreCommand.DESTROY,
                    error: err,
                }));
        },
    };
}

export function createCoreComponent() : Component {
    if (!isQueueRouterUsable() || useEnv('env') === EnvironmentName.TEST) {
        // todo: maybe log
        return {
            start() {
                useLogger().warn('Core component could not be started');
            },
        };
    }

    const queueRouter = useQueueRouter();

    return {
        start() {
            return queueRouter.consume(CoreTaskQueueRouterRouting, createHandlers());
        },
    };
}
