/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';

/**
 * Port for recalculating analysis metadata.
 * Implemented by AnalysisMetadataComponentCaller in app layer.
 */
export interface IAnalysisMetadataCaller {
    callRecalcDirect(data: { analysisId: string }): Promise<Analysis>;
}

/**
 * Port for triggering analysis build operations on the worker.
 * Implemented by AnalysisBuilderComponentCaller in server-core-worker-kit.
 */
export interface IAnalysisBuilderCaller {
    callExecute(data: { id: string }): Promise<void>;
    callCheck(data: { id: string }): Promise<void>;
}
