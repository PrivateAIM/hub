/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export enum BucketCommand {
    CREATE = 'create',
    DELETE = 'delete',
}

export enum BucketEvent {
    CREATION_FAILED = 'creationFailed',
    CREATION_STARTED = 'creationStarted',
    CREATION_FINISHED = 'creationFinished',

    DELETION_FAILED = 'deletionFailed',
    DELETION_STARTED = 'deletionStarted',
    DELETION_FINISHED = 'deletionFinished',
}

export const BucketEventQueueRouterRouting = {
    type: QueueRouterRoutingType.PUB_SUB,
    key: 'storageBucketEvents',
};

export const BucketTaskQueueRouterRouting = {
    type: QueueRouterRoutingType.WORK,
    key: 'storageBucketTasks',
};
