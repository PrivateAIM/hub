/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export enum AnalysisCoreEvent {
    BUCKET_CREATED = 'bucketCreated',
    BUCKET_DELETED = 'bucketDeleted',

    CONFIGURING = 'configuring',
    CONFIGURED = 'configured',

    DESTROYING = 'destroying',
    DESTROYED = 'destroyed',

    FAILED = 'failed',

    NONE = 'none',
}

export enum AnalysisCoreCommand {
    CONFIGURE = 'configure',
    DESTROY = 'destroy',
}

export const AnalysisCoreEventQueueRouterRouting = {
    type: QueueRouterRoutingType.PUB_SUB,
    key: 'analysisCoreEvents',
};

export const AnalysisCoreTaskQueueRouterRouting = {
    type: QueueRouterRoutingType.WORK,
    key: 'analysisCoreCommands',
};
