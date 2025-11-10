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
    EXECUTION_FINISHED = 'executionFinished',

    PUSH_FAILED = 'pushFailed',
    PUSHING = 'pushing',
    PUSHED = 'pushed',

    CHECK_FAILED = 'checkFailed',
    CHECK_STARTED = 'checking',
    CHECK_FINISHED = 'checked',

    NONE = 'none',
}

export enum AnalysisBuilderCommand {
    EXECUTE = 'execute',
    CHECK = 'check',
    PUSH = 'push',
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
