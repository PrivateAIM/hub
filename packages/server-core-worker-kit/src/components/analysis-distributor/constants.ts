/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { MessageBusRoutingType } from '@privateaim/server-kit';

export enum AnalysisDistributorEvent {
    EXECUTION_STARTED = 'executionStarted',
    EXECUTION_PROGRESS = 'executionProgress',
    EXECUTION_FINISHED = 'executionFinished',
    EXECUTION_FAILED = 'executionFailed',

    CHECK_STARTED = 'checkStarted',
    CHECK_FINISHED = 'checkFinished',
    CHECK_FAILED = 'checkFailed',
}

export enum AnalysisDistributorCommand {
    EXECUTE = 'execute',
    CHECK = 'check',
}

export const AnalysisDistributorEventMessageBusRouting = {
    type: MessageBusRoutingType.PUB_SUB,
    key: 'analysisDistributorEvents',
};

export const AnalysisDistributorTaskMessageBusRouting = {
    type: MessageBusRoutingType.WORK,
    key: 'analysisDistributorCommands',
};
