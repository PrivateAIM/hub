/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    MasterImagesBuildCommandPayload,
    MasterImagesPushCommandPayload,
    MasterImagesSynchronizeCommandPayload,
} from '@privateaim/server-analysis-manager-kit';
import {
    MasterImagesCommand,
    MasterImagesEvent,
    MasterImagesTaskQueueRouterRouting,
} from '@privateaim/server-analysis-manager-kit';
import type { Component, QueueRouterHandlers } from '@privateaim/server-kit';
import { isQueueRouterUsable, useLogger, useQueueRouter } from '@privateaim/server-kit';
import { EnvironmentName, useEnv } from '../../config';
import {
    executeMasterImagesBuildCommand,
    executeMasterImagesPushCommand,
    executeMasterImagesSynchronizeCommand,
} from './commands';
import {
    writeMasterImagesEvent,
} from './queue';

function createHandlers() : QueueRouterHandlers<{
    [MasterImagesCommand.SYNCHRONIZE]: MasterImagesSynchronizeCommandPayload,
    [MasterImagesCommand.BUILD]: MasterImagesBuildCommandPayload,
    [MasterImagesCommand.PUSH]: MasterImagesPushCommandPayload
}> {
    return {
        [MasterImagesCommand.SYNCHRONIZE]: async (message) => {
            await Promise.resolve(message.data)
                .then((data) => executeMasterImagesSynchronizeCommand(data))
                .catch((err: Error) => {
                    // todo: use logger
                    console.error(err);

                    return writeMasterImagesEvent({
                        event: MasterImagesEvent.SYNCHRONIZATION_FAILED,
                        data: {
                            error: err,
                        },
                    });
                });
        },
        [MasterImagesCommand.BUILD]: async (message) => {
            await Promise.resolve(message.data)
                .then((data) => executeMasterImagesBuildCommand(data))
                .catch((err: Error) => {
                    // todo: use logger
                    console.error(err);

                    return writeMasterImagesEvent({
                        event: MasterImagesEvent.BUILD_FAILED,
                        data: {
                            error: err,
                        },
                    });
                });
        },
        [MasterImagesCommand.PUSH]: async (message) => {
            await Promise.resolve(message.data)
                .then((data) => executeMasterImagesPushCommand(data))
                .catch((err: Error) => {
                    // todo: use logger
                    console.error(err);

                    return writeMasterImagesEvent({
                        event: MasterImagesEvent.PUSH_FAILED,
                        data: {
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

    const queueRouter = useQueueRouter();

    return {
        start() {
            return queueRouter.consume(MasterImagesTaskQueueRouterRouting, createHandlers());
        },
    };
}
