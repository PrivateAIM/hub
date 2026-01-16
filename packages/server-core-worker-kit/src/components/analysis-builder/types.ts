/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteralKeys, ProcessStatus } from '@privateaim/kit';
import type { ComponentMetadata } from '@privateaim/server-kit';
import type { Progress } from 'docken';
import type { AnalysisBuilderCommand, AnalysisBuilderEvent } from './constants';

export type AnalysisBuilderBasePayload = {
    id: string,
    error?: Error
};

export type AnalysisBuilderExecutePayload = AnalysisBuilderBasePayload;

export type AnalysisBuilderExecutionFinishedPayload = AnalysisBuilderBasePayload & {
    /**
     * sha
     */
    hash?: string,
    /**
     * image size in bytes
     */
    size?: number,
    /**
     * operating system (windows, linux, ...)
     */
    os?: string
};

export type AnalysisBuilderExecutionProgressPayload = AnalysisBuilderBasePayload & {
    progress: Progress
};

export type AnalysisBuilderCheckPayload = AnalysisBuilderBasePayload;

export type AnalysisBuilderCheckFinishedPayload = AnalysisBuilderBasePayload & {
    status?: `${ProcessStatus}`,
    /**
     * sha
     */
    hash?: string,
    /**
     * image size in bytes
     */
    size?: number,
    /**
     * operating system (windows, linux, ...)
     */
    os?: string
};

export type AnalysisBuilderEventMap = ObjectLiteralKeys<{
    [AnalysisBuilderCommand.EXECUTE]: [AnalysisBuilderExecutePayload, ComponentMetadata],
    [AnalysisBuilderEvent.EXECUTION_FAILED]: [AnalysisBuilderExecutePayload, ComponentMetadata],
    [AnalysisBuilderEvent.EXECUTION_STARTED]: [AnalysisBuilderExecutePayload, ComponentMetadata],
    [AnalysisBuilderEvent.EXECUTION_PROGRESS]: [AnalysisBuilderExecutionProgressPayload, ComponentMetadata],
    [AnalysisBuilderEvent.EXECUTION_FINISHED]: [AnalysisBuilderExecutionFinishedPayload, ComponentMetadata],

    [AnalysisBuilderCommand.CHECK]: [AnalysisBuilderCheckPayload, ComponentMetadata],
    [AnalysisBuilderEvent.CHECK_STARTED]: [AnalysisBuilderCheckPayload, ComponentMetadata],
    [AnalysisBuilderEvent.CHECK_FAILED]: [AnalysisBuilderCheckPayload, ComponentMetadata],
    [AnalysisBuilderEvent.CHECK_FINISHED]: [AnalysisBuilderCheckFinishedPayload, ComponentMetadata],
}>;
