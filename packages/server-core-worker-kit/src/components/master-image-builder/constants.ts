/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export enum MasterImageBuilderEvent {
    EXECUTION_FAILED = 'executionFailed',
    EXECUTION_STARTED = 'executionStarted',
    EXECUTION_PROGRESS = 'executionProgress',
    EXECUTION_FINISHED = 'executionFinished',
}

export enum MasterImageBuilderCommand {
    EXECUTE = 'execute',
}

export const MasterImageBuilderEventQueueRouterRouting = {
    type: QueueRouterRoutingType.PUB_SUB,
    key: 'masterImageBuilderEvents',
};

export const MasterImageBuilderTaskQueueRouterRouting = {
    type: QueueRouterRoutingType.WORK,
    key: 'masterImageBuilderTasks',
};
