/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MessageBusRoutingType } from 'ergos';

export enum MasterImageBuilderEvent {
    EXECUTION_FAILED = 'executionFailed',
    EXECUTION_STARTED = 'executionStarted',
    EXECUTION_PROGRESS = 'executionProgress',
    EXECUTION_FINISHED = 'executionFinished',
}

export enum MasterImageBuilderCommand {
    EXECUTE = 'execute',
}

export const MasterImageBuilderEventMessageBusRouting = {
    // A reply to a server-core command: one durable queue for all server-core
    // replicas, handled by one of them at a time in publish order (plan 018 F4).
    type: MessageBusRoutingType.WORK,
    key: 'masterImageBuilderEvents',
    ordered: true,
};

export const MasterImageBuilderTaskMessageBusRouting = {
    type: MessageBusRoutingType.WORK,
    key: 'masterImageBuilderTasks',
};
