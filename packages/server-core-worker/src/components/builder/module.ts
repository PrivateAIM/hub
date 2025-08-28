/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    BuilderBuildPayload,
    BuilderCheckPayload,
    BuilderPushPayload,
} from '@privateaim/server-core-worker-kit';
import {
    BuilderCommand,
    BuilderTaskQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import {
    EnvironmentName, isQueueRouterUsable, useLogger, useQueueRouter,
} from '@privateaim/server-kit';
import type { Component, QueueRouterHandlers } from '@privateaim/server-kit';
import { useEnv } from '../../config';
import { cleanupDockerImage } from '../../core';
import { extendPayload } from '../utils';
import { executeBuilderBuildCommand, executeBuilderCheckCommand, executePushCommand } from './commands';
import {
    writeBuildFailedEvent,
    writeBuildingEvent,
    writeBuiltEvent,
    writeCheckFailedEvent,
    writeCheckedEvent,
    writeCheckingEvent,
    writePushCommand,
    writePushFailedEvent,
    writePushedEvent, writePushingEvent,
} from './queue';

function createHandlers() : QueueRouterHandlers<{
    [BuilderCommand.BUILD]: BuilderBuildPayload,
    [BuilderCommand.CHECK]: BuilderCheckPayload,
    [BuilderCommand.PUSH]: BuilderPushPayload
}> {
    return {
        [BuilderCommand.BUILD]: async (message) => {
            await Promise.resolve(message.data)
                .then((data) => extendPayload(data))
                .then((data) => writeBuildingEvent(data))
                .then(executeBuilderBuildCommand)
                .then((data) => writeBuiltEvent(data))
                .then((data) => writePushCommand(data))
                .catch((err: Error) => {
                    message.data.error = err;
                    return cleanupDockerImage(message.data.id)
                        .finally(() => writeBuildFailedEvent(message.data));
                });
        },
        [BuilderCommand.PUSH]: async (message) => {
            await Promise.resolve(message.data)
                .then((data) => writePushingEvent(data))
                .then(executePushCommand)
                .then((data) => writePushedEvent(data))
                .catch((err: Error) => {
                    message.data.error = err;
                    return writePushFailedEvent(message.data);
                });
        },
        [BuilderCommand.CHECK]: async (message) => {
            await Promise.resolve(message.data)
                .then((data) => extendPayload(data))
                .then((data) => writeCheckingEvent(data))
                .then(executeBuilderCheckCommand)
                .then((data) => writeCheckedEvent(data))
                .catch((err: Error) => {
                    message.data.error = err;
                    return writeCheckFailedEvent(message.data);
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
