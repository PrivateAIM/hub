/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Component, QueueRouterHandlers } from '@privateaim/server-kit';
import {
    EnvironmentName,
    isQueueRouterUsable,
    useLogger,
    useQueueRouter,
} from '@privateaim/server-kit';
import { useEnv } from '../../config';
import { RegistryCommand, RegistryTaskQueueRouterRouting } from './constants';
import {
    dispatchRegistryEventToTrainManager,
    linkRegistryProject,
    relinkRegistryProject,
    setupRegistry,
    unlinkRegistryProject,
} from './handlers';
import { cleanupRegistry } from './handlers/cleanup';
import type {
    RegistryCleanupPayload,
    RegistryEventPayload,
    RegistryProjectLinkPayload,
    RegistryProjectRelinkPayload,
    RegistryProjectUnlinkPayload,
    RegistrySetupPayload,
} from './type';

function createRegistryQueueHandlers() : QueueRouterHandlers<{
    [RegistryCommand.SETUP]: RegistrySetupPayload,
    [RegistryCommand.EVENT_HANDLE]: RegistryEventPayload,
    [RegistryCommand.DELETE]: RegistrySetupPayload,
    [RegistryCommand.CLEANUP]: RegistryCleanupPayload,
    [RegistryCommand.PROJECT_LINK]: RegistryProjectLinkPayload,
    [RegistryCommand.PROJECT_UNLINK]: RegistryProjectUnlinkPayload,
    [RegistryCommand.PROJECT_RELINK]: RegistryProjectRelinkPayload,
}> {
    return {
        [RegistryCommand.SETUP]: async (message) => {
            await setupRegistry(message.data);
        },
        [RegistryCommand.EVENT_HANDLE]: async (message) => {
            await dispatchRegistryEventToTrainManager(message.data);
        },
        [RegistryCommand.DELETE]: async () => {

        },
        [RegistryCommand.CLEANUP]: async (message) => {
            await cleanupRegistry(message.data);
        },
        [RegistryCommand.PROJECT_LINK]: async (message) => {
            await linkRegistryProject(message.data);
        },
        [RegistryCommand.PROJECT_UNLINK]: async (message) => {
            await unlinkRegistryProject(message.data);
        },
        [RegistryCommand.PROJECT_RELINK]: async (message) => {
            await relinkRegistryProject(message.data);
        },
    };
}

export function createRegistryComponent() : Component {
    if (!isQueueRouterUsable() || useEnv('env') === EnvironmentName.TEST) {
        // todo: maybe log
        return {
            start() {
                useLogger().warn('Registry component has not been initialized');
            },
        };
    }

    const queueRouter = useQueueRouter();

    return {
        start() {
            return queueRouter.consume(RegistryTaskQueueRouterRouting, createRegistryQueueHandlers());
        },
    };
}
