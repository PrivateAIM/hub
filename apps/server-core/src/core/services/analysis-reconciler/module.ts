/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
import { ANALYSIS_PROCESS_STALE_THRESHOLD_MS, isProcessStatusInProgress } from '../helpers.ts';
import type {
    AnalysisReconcileResult,
    AnalysisReconcilerContext,
    IAnalysisProcessChecker,
    IAnalysisReconciler,
} from './types.ts';

/**
 * Re-checks builds/distributions stuck in STARTING/STARTED (F14). It only
 * dispatches the existing check commands; the verdict — FAILED once the row
 * is stale — is applied when the worker's CHECK_FINISHED comes back.
 */
export class AnalysisReconciler implements IAnalysisReconciler {
    protected ctx: AnalysisReconcilerContext;

    constructor(ctx: AnalysisReconcilerContext) {
        this.ctx = ctx;
    }

    async reconcile(now: Date = new Date()): Promise<AnalysisReconcileResult> {
        const updatedBefore = new Date(now.getTime() - ANALYSIS_PROCESS_STALE_THRESHOLD_MS);
        const analyses = await this.ctx.repository.findManyInProgressUpdatedBefore(updatedBefore);

        const result: AnalysisReconcileResult = { checked: 0, failed: 0 };
        for (const analysis of analyses) {
            if (isProcessStatusInProgress(analysis.buildStatus)) {
                await this.check(this.ctx.builder, analysis, 'build', result);
                // a distribution requires an EXECUTED build — while the build
                // is in progress, a distribution check only fails in canCheck.
                continue;
            }

            if (isProcessStatusInProgress(analysis.distributionStatus)) {
                await this.check(this.ctx.distributor, analysis, 'distribution', result);
            }
        }

        return result;
    }

    /**
     * One bad row (canCheck refusing it, a failed dispatch) must not keep
     * the others from being checked: it is logged and retried next pass.
     */
    protected async check(
        checker: IAnalysisProcessChecker,
        analysis: Analysis,
        process: string,
        result: AnalysisReconcileResult,
    ): Promise<void> {
        try {
            await checker.check(analysis);
            result.checked++;
        } catch (e) {
            result.failed++;
            this.ctx.logger?.error(`Could not check the stuck ${process} of an analysis: ${e instanceof Error ? e.message : String(e)}`, {
                [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
                [LogFlag.REF_ID]: analysis.id,
            });
        }
    }
}
