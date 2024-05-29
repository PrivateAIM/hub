/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    BuilderBuildPayload,
    BuilderCheckPayload,
} from '@privateaim/server-analysis-manager-kit';
import {
    BuilderCommand,
    BuilderTaskQueueRouterRouting,
} from '@privateaim/server-analysis-manager-kit';
import type { Component, QueueRouterHandlers } from '@privateaim/server-kit';
import { isQueueRouterUsable, useLogger, useQueueRouter } from '@privateaim/server-kit';
import { EnvironmentName, useEnv } from '../../config';
import { extendPayload } from '../utils';
import { executeBuilderBuildCommand, executeBuilderCheckCommand, executePushCommand } from './commands';
import {
    writeBuildingEvent,
    writeBuiltEvent,
    writeCheckedEvent,
    writeCheckingEvent,
    writeFailedEvent,
    writePushedEvent,
    writePushingEvent,
} from './events';
import { useBuilderLogger } from './utils';

function createHandlers() : QueueRouterHandlers<{
    [BuilderCommand.BUILD]: BuilderBuildPayload,
    [BuilderCommand.CHECK]: BuilderCheckPayload
}> {
    return {
        [BuilderCommand.BUILD]: async (message) => {
            await Promise.resolve(message.data)
                .then((data) => extendPayload(data))
                .then((data) => writeBuildingEvent({ data, command: BuilderCommand.BUILD }))
                .then(executeBuilderBuildCommand)
                .then((data) => writeBuiltEvent({ data, command: BuilderCommand.BUILD }))
                .then((data) => writePushingEvent({ data, command: BuilderCommand.BUILD }))
                .then(executePushCommand)
                .then((data) => writePushedEvent({ data, command: BuilderCommand.BUILD }))
                .catch((err: Error) => {
                    useBuilderLogger().error(err);

                    return writeFailedEvent({
                        data: message.data,
                        command: BuilderCommand.BUILD,
                        error: err,
                    });
                });
        },
        [BuilderCommand.CHECK]: async (message) => {
            await Promise.resolve(message.data)
                .then((data) => extendPayload(data))
                .then((data) => writeCheckingEvent({ data, command: BuilderCommand.CHECK }))
                .then(executeBuilderCheckCommand)
                .then((data) => writeCheckedEvent({ data, command: BuilderCommand.CHECK }))
                .catch((err: Error) => {
                    useBuilderLogger().error(err);

                    return writeFailedEvent({
                        data: message.data,
                        command: BuilderCommand.CHECK,
                        error: err,
                    });
                });
        },
    };
}

export function createBuilderComponent() : Component {
    if (!isQueueRouterUsable() || useEnv('env') === EnvironmentName.TEST) {
        // todo: maybe log
        return {
            start() {
                useLogger().warn('Builder component could not be started');
            },
        };
    }

    const queueRouter = useQueueRouter();

    return {
        start() {
            return queueRouter.consume(BuilderTaskQueueRouterRouting, createHandlers());
        },
    };
}
