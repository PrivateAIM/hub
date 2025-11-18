/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export enum MasterImageSynchronizerEvent {
    EXECUTION_FAILED = 'executionFailed',
    EXECUTION_STARTED = 'executionStarted',
    EXECUTION_FINISHED = 'executionFinished',

}

export enum MasterImageSynchronizerCommand {
    EXECUTE = 'execute',
}

export const MasterImageSynchronizerEventQueueRouterRouting = {
    type: QueueRouterRoutingType.PUB_SUB,
    key: 'masterImageSynchronizerEvents',
};

export const MasterImageSynchronizerTaskQueueRouterRouting = {
    type: QueueRouterRoutingType.WORK,
    key: 'masterImageSynchronizerTasks',
};
