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
    writeBuildingEvent,
    writeBuiltEvent,
    writeFailedEvent,
    writePushedEvent,
    writePushingEvent,
    writeSynchronizedEvent,
    writeSynchronizingEvent,
} from './queue';

function createHandlers() : QueueRouterHandlers<{
    [MasterImagesCommand.SYNCHRONIZE]: MasterImagesSynchronizeCommandPayload,
    [MasterImagesCommand.BUILD]: MasterImagesBuildCommandPayload,
    [MasterImagesCommand.PUSH]: MasterImagesPushCommandPayload
}> {
    return {
        [MasterImagesCommand.SYNCHRONIZE]: async (message) => {
            await Promise.resolve(message.data)
                .then((data) => writeSynchronizingEvent(data))
                .then((data) => executeMasterImagesSynchronizeCommand(data))
                .then((data) => writeSynchronizedEvent(data))
                .catch((err: Error) => {
                    // todo: use logger
                    console.error(err);

                    return writeFailedEvent(MasterImagesEvent.SYNCHRONIZATION_FAILED, {
                        error: err,
                    });
                });
        },
        [MasterImagesCommand.BUILD]: async (message) => {
            await Promise.resolve(message.data)
                .then((data) => writeBuildingEvent(data))
                .then((data) => executeMasterImagesBuildCommand(data))
                .then((data) => writeBuiltEvent(data))
                .catch((err: Error) => {
                    // todo: use logger
                    console.error(err);

                    return writeFailedEvent(MasterImagesEvent.BUILD_FAILED, {
                        error: err,
                    });
                });
        },
        [MasterImagesCommand.PUSH]: async (message) => {
            await Promise.resolve(message.data)
                .then((data) => writePushingEvent((data)))
                .then((data) => executeMasterImagesPushCommand(data))
                .then((data) => writePushedEvent(data))
                .catch((err: Error) => {
                    // todo: use logger
                    console.error(err);

                    return writeFailedEvent(MasterImagesEvent.PUSH_FAILED, {
                        error: err,
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
