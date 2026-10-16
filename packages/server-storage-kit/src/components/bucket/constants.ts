/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MessageRoutingType } from 'synergos';

export enum BucketCommand {
    CREATE = 'create',
    DELETE = 'delete',
    CLEAR = 'clear',
}

export enum BucketEvent {
    CREATION_FAILED = 'creationFailed',
    CREATION_STARTED = 'creationStarted',
    CREATION_FINISHED = 'creationFinished',

    DELETION_FAILED = 'deletionFailed',
    DELETION_STARTED = 'deletionStarted',
    DELETION_FINISHED = 'deletionFinished',

    CLEARING_FAILED = 'clearingFailed',
    CLEARING_STARTED = 'clearingStarted',
    CLEARING_FINISHED = 'clearingFinished',
}

export const BucketEventMessageBusRouting = {
    // A reply to a server-core command: one durable queue for all server-core
    // replicas, handled by one of them at a time in publish order (plan 018 F4).
    type: MessageRoutingType.WORK,
    key: 'storageBucketEvents',
    ordered: true,
};

export const BucketTaskMessageBusRouting = {
    type: MessageRoutingType.WORK,
    key: 'storageBucketTasks',
};
