/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MasterImagesCommandMap,
} from '@privateaim/server-core-worker-kit';
import {
    MasterImagesCommand,
    MasterImagesEvent,
    useMasterImageQueueService,
} from '@privateaim/server-core-worker-kit';
import type { Component, QueueRouterHandlers } from '@privateaim/server-kit';
import { isQueueRouterUsable, useLogger } from '@privateaim/server-kit';
import { EnvironmentName, useEnv } from '../../config';
import {
    executeMasterImagesBuildCommand,
    executeMasterImagesPushCommand,
    executeMasterImagesSynchronizeCommand,
} from './commands';

function createHandlers() : QueueRouterHandlers<MasterImagesCommandMap> {
    return {
        [MasterImagesCommand.SYNCHRONIZE]: async (
            message,
        ) => {
            await Promise.resolve(message.data)
                .then((data) => executeMasterImagesSynchronizeCommand(data))
                .catch((err: Error) => {
                    // todo: use logger
                    console.error(err);

                    const queue = useMasterImageQueueService();
                    return queue.publishEvent({
                        event: MasterImagesEvent.SYNCHRONIZATION_FAILED,
                        data: {
                            error: err,
                        },
                    });
                });
        },
        [MasterImagesCommand.BUILD]: async (
            message,
        ) => {
            await Promise.resolve(message.data)
                .then((data) => executeMasterImagesBuildCommand(data))
                .catch((err: Error) => {
                    // todo: use logger
                    console.error(err);

                    const queue = useMasterImageQueueService();
                    return queue.publishEvent({
                        event: MasterImagesEvent.BUILD_FAILED,
                        data: {
                            id: message.data.id,
                            error: err,
                        },
                    });
                });
        },
        [MasterImagesCommand.PUSH]: async (
            message,
        ) => {
            await Promise.resolve(message.data)
                .then((data) => executeMasterImagesPushCommand(data))
                .catch((err: Error) => {
                    // todo: use logger
                    console.error(err);

                    const queue = useMasterImageQueueService();
                    return queue.publishEvent({
                        event: MasterImagesEvent.PUSH_FAILED,
                        data: {
                            id: message.data.id,
                            error: err,
                        },
                    });
                });
        },
    };
}

export function createMasterImagesComponent() : Component {
    if (!isQueueRouterUsable() || useEnv('env') === EnvironmentName.TEST) {
        // todo: maybe log
        return {
            start() {
                useLogger().warn('MasterImages component could not be started');
            },
        };
    }

    const queue = useMasterImageQueueService();

    return {
        start() {
            return queue.consumeCommands(createHandlers());
        },
    };
}
