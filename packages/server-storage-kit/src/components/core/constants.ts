/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export enum CoreEvent {
    CREATE_FAILED = 'createFailed',
    CREATING = 'creating',
    CREATED = 'created',

    DESTROY_FAILED = 'destroyFailed',
    DESTROYING = 'destroying',
    DESTROYED = 'destroyed',
}

export enum CoreCommand {
    CREATE = 'create',
    DESTROY = 'destroy',
}

export const CoreEventQueueRouterRouting = {
    type: QueueRouterRoutingType.PUB_SUB,
    key: 'storageCoreEvents',
};

export const CoreTaskQueueRouterRouting = {
    type: QueueRouterRoutingType.WORK,
    key: 'storageCoreCommands',
};
