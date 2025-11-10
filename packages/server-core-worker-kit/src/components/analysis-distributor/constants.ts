/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export enum AnalysisDistributorEvent {
    EXECUTION_STARTED = 'executionStarted',
    EXECUTION_FINISHED = 'executionFinished',
    EXECUTION_FAILED = 'executionFailed',
}

export enum AnalysisDistributorCommand {
    EXECUTE = 'execute',
}

export const AnalysisDistributorEventQueueRouterRouting = {
    type: QueueRouterRoutingType.PUB_SUB,
    key: 'analysisDistributorEvents',
};

export const AnalysisDistributorTaskQueueRouterRouting = {
    type: QueueRouterRoutingType.WORK,
    key: 'analysisDistributorCommands',
};
