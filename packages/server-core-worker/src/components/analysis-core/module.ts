/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AnalysisCoreCommand,
    AnalysisCoreTaskQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import type { AnalysisCoreConfigurePayload, AnalysisCoreDestroyPayload } from '@privateaim/server-core-worker-kit';
import type { IComponent, QueueRouterHandlers } from '@privateaim/server-kit';
import {
    EnvironmentName, isQueueRouterUsable, useLogger, useQueueRouter,
} from '@privateaim/server-kit';
import { useEnv } from '../../config';
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
    [AnalysisCoreCommand.CONFIGURE]: AnalysisCoreConfigurePayload,
    [AnalysisCoreCommand.DESTROY]: AnalysisCoreDestroyPayload
}> {
    return {
        [AnalysisCoreCommand.CONFIGURE]: async (message) => {
            await Promise.resolve(message.data)
                .then((data) => writeConfiguringEvent(data))
                .then(executeCoreConfigureCommand)
                .then((data) => writeConfiguredEvent(data))
                .catch((err: Error) => writeFailedEvent({
                    data: message.data,
                    command: AnalysisCoreCommand.CONFIGURE,
                    error: err,
                }));
        },
        [AnalysisCoreCommand.DESTROY]: async (message) => {
            await Promise.resolve(message.data)
                .then((data) => writeDestroyingEvent(data))
                .then(executeCoreDestroyCommand)
                .then((data) => writeDestroyedEvent(data))
                .catch((err: Error) => writeFailedEvent({
                    data: message.data,
                    command: AnalysisCoreCommand.DESTROY,
                    error: err,
                }));
        },
    };
}

export function createCoreComponent() : IComponent {
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
            return queueRouter.consume(AnalysisCoreTaskQueueRouterRouting, createHandlers());
        },
    };
}
