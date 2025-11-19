/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export enum RegistryCommand {
    CLEANUP = 'CLEANUP',
    SETUP = 'SETUP',
    DELETE = 'DELETE',

    PROJECT_LINK = 'PROJECT_LINK',
    PROJECT_RELINK = 'PROJECT_RELINK',
    PROJECT_UNLINK = 'PROJECT_UNLINK',

    HOOK_PROCESS = 'HOOK_PROCESS',
}

export enum RegistryHookEvent {
    PUSH_ARTIFACT = 'PUSH_ARTIFACT',
    PULL_ARTIFACT = 'PULL_ARTIFACT',
    DELETE_ARTIFACT = 'DELETE_ARTIFACT',

    SCANNING_COMPLETED = 'SCANNING_COMPLETED',
    SCANNING_FAILED = 'SCANNING_FAILED',

    QUOTA_EXCEED = 'QUOTA_EXCEED',
    QUOTA_WARNING = 'QUOTA_WARNING',
}

export const RegistryEventQueueRouterRouting = {
    type: QueueRouterRoutingType.PUB_SUB,
    key: 'registryEvents',
};

export const RegistryTaskQueueRouterRouting = {
    type: QueueRouterRoutingType.WORK,
    key: 'registryCommands',
};
