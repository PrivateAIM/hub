/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Component, Logger } from '@privateaim/server-kit';
import type { IAnalysisReconciler } from '../../../core/services/analysis-reconciler/index.ts';

export type AnalysisReconcilerComponentContext = {
    reconciler: IAnalysisReconciler,
    logger?: Logger,
};

export type AnalysisReconcilerComponent = Component & {
    start: () => Promise<void>,
    stop: () => Promise<void>,
    /**
     * Epoch millis of the last pass that completed without an error, and of
     * the start of the pass in flight; each undefined while there is none.
     */
    status: () => { lastSuccessAt?: number, runningSince?: number },
};
