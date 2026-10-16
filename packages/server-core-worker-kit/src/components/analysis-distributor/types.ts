/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { ObjectLiteralKeys, ProcessStatus } from '@privateaim/kit';
import type { ComponentMetadata } from 'hubwire';
import type { Progress } from 'docken';
import type { AnalysisDistributorCommand, AnalysisDistributorEvent } from './constants';

export type AnalysisDistributorBasePayload = {
    id: string,
    error?: Error
};

export type AnalysisDistributorExecutePayload = AnalysisDistributorBasePayload;

export type AnalysisDistributorExecutionProgressPayload = AnalysisDistributorBasePayload & {
    progress: Progress
};

export type AnalysisDistributorCheckPayload = AnalysisDistributorBasePayload;

export type AnalysisDistributorCheckFinishedPayload = AnalysisDistributorBasePayload & {
    status?: `${ProcessStatus}`,
    /**
     * `updatedAt` of the analysis snapshot the verdict was made on, so a
     * verdict about an older state can be told apart and dropped. Optional:
     * absent from workers predating it.
     */
    checkedAt?: string,
};

export type AnalysisDistributorEventMap = ObjectLiteralKeys<{
    [AnalysisDistributorCommand.EXECUTE]: [AnalysisDistributorExecutePayload, ComponentMetadata],
    [AnalysisDistributorEvent.EXECUTION_FAILED]: [AnalysisDistributorExecutePayload, ComponentMetadata],
    [AnalysisDistributorEvent.EXECUTION_STARTED]: [AnalysisDistributorExecutePayload, ComponentMetadata],
    [AnalysisDistributorEvent.EXECUTION_PROGRESS]: [AnalysisDistributorExecutionProgressPayload, ComponentMetadata],
    [AnalysisDistributorEvent.EXECUTION_FINISHED]: [AnalysisDistributorExecutePayload, ComponentMetadata],

    [AnalysisDistributorCommand.CHECK]: [AnalysisDistributorCheckPayload, ComponentMetadata],
    [AnalysisDistributorEvent.CHECK_STARTED]: [AnalysisDistributorCheckPayload, ComponentMetadata],
    [AnalysisDistributorEvent.CHECK_FAILED]: [AnalysisDistributorCheckPayload, ComponentMetadata],
    [AnalysisDistributorEvent.CHECK_FINISHED]: [AnalysisDistributorCheckFinishedPayload, ComponentMetadata],
}>;
