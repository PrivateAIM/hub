/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export enum CoreEvent {
    BUCKET_CREATED = 'bucketCreated',
    BUCKET_DELETED = 'bucketDeleted',

    CONFIGURING = 'configuring',
    CONFIGURED = 'configured',

    DESTROYING = 'destroying',
    DESTROYED = 'destroyed',

    FAILED = 'failed',

    NONE = 'none',
}

export enum CoreCommand {
    CONFIGURE = 'configure',
    DESTROY = 'destroy',
}

export const CoreEventQueueRouterRouting = {
    type: QueueRouterRoutingType.PUB_SUB,
    key: 'analysisCoreEvents',
};

export const CoreTaskQueueRouterRouting = {
    type: QueueRouterRoutingType.WORK,
    key: 'analysisCoreCommands',
};
