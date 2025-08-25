/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export enum AnalysisAllocationEvent {
    BUCKET_CREATED = 'bucketCreated',
    BUCKET_DELETED = 'bucketDeleted',

    CONFIGURING = 'configuring',
    CONFIGURED = 'configured',

    DESTROYING = 'destroying',
    DESTROYED = 'destroyed',

    FAILED = 'failed',
}

export enum AnalysisAllocationCommand {
    ALLOCATE = 'allocate',
}

export const AnalysisAllocationQueueRouterRouting = {
    type: QueueRouterRoutingType.PUB_SUB,
    key: 'analysisAllocationEvents',
};

export const AnalysisAllocationTaskQueueRouterRouting = {
    type: QueueRouterRoutingType.WORK,
    key: 'analysisAllocationCommands',
};
