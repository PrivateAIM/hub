/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MessageBusRoutingType } from '@privateaim/server-kit';

export enum BucketFileCommand {
    CREATE = 'create',
    DELETE = 'delete',
}

export enum BucketFileEvent {
    CREATION_FAILED = 'creationFailed',
    CREATION_STARTED = 'creationStarted',
    CREATION_FINISHED = 'creationFinished',

    DELETION_FAILED = 'deletionFailed',
    DELETION_STARTED = 'deletionStarted',
    DELETION_FINISHED = 'deletionFinished',
}

export const BucketFileEventMessageBusRouting = {
    type: MessageBusRoutingType.PUB_SUB,
    key: 'storageBucketFileEvents',
};

export const BucketFileTaskMessageBusRouting = {
    type: MessageBusRoutingType.WORK,
    key: 'storageBucketFileTasks',
};
