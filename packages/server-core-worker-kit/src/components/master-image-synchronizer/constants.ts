/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MessageBusRoutingType } from '@privateaim/server-kit';

export enum MasterImageSynchronizerEvent {
    EXECUTION_FAILED = 'executionFailed',
    EXECUTION_STARTED = 'executionStarted',
    EXECUTION_FINISHED = 'executionFinished',

}

export enum MasterImageSynchronizerCommand {
    EXECUTE = 'execute',
}

export const MasterImageSynchronizerEventMessageBusRouting = {
    type: MessageBusRoutingType.PUB_SUB,
    key: 'masterImageSynchronizerEvents',
};

export const MasterImageSynchronizerTaskMessageBusRouting = {
    type: MessageBusRoutingType.WORK,
    key: 'masterImageSynchronizerTasks',
};
