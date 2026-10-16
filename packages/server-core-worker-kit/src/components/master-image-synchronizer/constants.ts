/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MessageRoutingType } from 'synergos';

export enum MasterImageSynchronizerEvent {
    EXECUTION_FAILED = 'executionFailed',
    EXECUTION_STARTED = 'executionStarted',
    EXECUTION_FINISHED = 'executionFinished',

}

export enum MasterImageSynchronizerCommand {
    EXECUTE = 'execute',
}

export const MasterImageSynchronizerEventMessageBusRouting = {
    // A reply to a server-core command: one durable queue for all server-core
    // replicas, handled by one of them at a time in publish order (plan 018 F4).
    type: MessageRoutingType.WORK,
    key: 'masterImageSynchronizerEvents',
    ordered: true,
};

export const MasterImageSynchronizerTaskMessageBusRouting = {
    type: MessageRoutingType.WORK,
    key: 'masterImageSynchronizerTasks',
};
