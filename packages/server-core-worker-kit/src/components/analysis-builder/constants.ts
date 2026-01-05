/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export enum AnalysisBuilderEvent {
    EXECUTION_FAILED = 'executionFailed',
    EXECUTION_STARTED = 'executionStarted',
    EXECUTION_PROGRESS = 'executionProgress',
    EXECUTION_FINISHED = 'executionFinished',

    CHECK_FAILED = 'checkFailed',
    CHECK_STARTED = 'checkStarted',
    CHECK_FINISHED = 'checkFinished',
}

export enum AnalysisBuilderCommand {
    EXECUTE = 'execute',
    CHECK = 'check',
}

export enum AnalysisBuilderErrorCode {
    ENTRYPOINT_NOT_FOUND = 'entrypointNotFound',
    MASTER_IMAGE_NOT_FOUND = 'masterImageNotFound',
    UNKNOWN = 'unknown',
}

export const AnalysisBuilderEventQueueRouterRouting = {
    type: QueueRouterRoutingType.PUB_SUB,
    key: 'analysisBuilderEvents',
};

export const AnalysisBuilderTaskQueueRouterRouting = {
    type: QueueRouterRoutingType.WORK,
    key: 'analysisBuilderCommands',
};
