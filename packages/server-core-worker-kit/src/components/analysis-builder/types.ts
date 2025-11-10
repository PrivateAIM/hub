/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBuilderCommand, AnalysisBuilderEvent } from './constants';

export type AnalysisBuilderBasePayload = {
    id: string,
    error?: Error
};

export type AnalysisBuilderExecutePayload = AnalysisBuilderBasePayload;
export type BuilderPushPayload = AnalysisBuilderBasePayload;
export type BuilderCheckPayload = AnalysisBuilderBasePayload;

export type BuilderBuildCommandContext = {
    command: `${AnalysisBuilderCommand.EXECUTE}`,
    data: AnalysisBuilderExecutePayload,
};

export type BuilderPushCommandContext = {
    command: `${AnalysisBuilderCommand.PUSH}`,
    data: BuilderPushPayload
};

export type BuilderCheckCommandContext = {
    command: `${AnalysisBuilderCommand.CHECK}`,
    data: BuilderCheckPayload
};

export type BuilderBuildEventContext = {
    data: AnalysisBuilderExecutePayload;
    event: `${AnalysisBuilderEvent.EXECUTION_FAILED}` |
        `${AnalysisBuilderEvent.EXECUTION_FINISHED}` |
        `${AnalysisBuilderEvent.EXECUTION_STARTED}`;
};

export type BuilderPushEventContext = {
    data: BuilderPushPayload,
    event: `${AnalysisBuilderEvent.PUSH_FAILED}` |
        `${AnalysisBuilderEvent.PUSHED}` |
        `${AnalysisBuilderEvent.PUSHING}`;
};

export type BuilderCheckEventContext = {
    data: BuilderCheckPayload,
    event: `${AnalysisBuilderEvent.CHECK_FAILED}` |
        `${AnalysisBuilderEvent.CHECK_FINISHED}` |
        `${AnalysisBuilderEvent.CHECK_STARTED}` |
        `${AnalysisBuilderEvent.NONE}`;
};

export type BuilderCommandContext = BuilderCheckCommandContext | BuilderBuildCommandContext | BuilderPushCommandContext;
export type BuilderEventContext = BuilderCheckEventContext | BuilderBuildEventContext | BuilderPushEventContext;
