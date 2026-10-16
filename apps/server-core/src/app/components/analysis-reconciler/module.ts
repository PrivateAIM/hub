/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IScheduledComponent } from 'hubwire';
import { defineScheduledComponent } from 'hubwire';
import type { AnalysisReconcileResult } from '../../../core/services/analysis-reconciler/index.ts';
import { ANALYSIS_RECONCILER_SCHEDULE } from './constants.ts';
import type { AnalysisReconcilerComponentContext } from './types.ts';

/**
 * Re-checks stuck builds/distributions (F14): one pass at start, then on
 * ANALYSIS_RECONCILER_SCHEDULE.
 *
 * A pass throws (after logging) whenever a check failed, so lastSuccessAt is
 * stamped only for a clean pass. No log hooks are handed to the scheduled
 * component: run() already logs at error level.
 *
 * ponytail: no database lock. Every replica runs its own pass, so a stuck
 * process may be checked once per replica — harmless: the first verdict
 * writes the row, and every later one is dropped by isCheckVerdictStale.
 * Add a lock (or skip_locked claiming) only if the duplicate checks start to cost.
 * Ceiling: CHECKs are not de-duplicated and carry no TTL (the message bus has
 * none), so while no worker consumes, every replica queues one per stuck
 * process per pass, and a returning worker drains that backlog ahead of later
 * EXECUTEs.
 */
export function createAnalysisReconcilerComponent(ctx: AnalysisReconcilerComponentContext): IScheduledComponent {
    return defineScheduledComponent({
        schedule: ANALYSIS_RECONCILER_SCHEDULE,
        run: async () => {
            let result: AnalysisReconcileResult;
            try {
                result = await ctx.reconciler.reconcile();
            } catch (e) {
                ctx.logger?.error(`Reconciling stuck analysis processes failed: ${e instanceof Error ? e.message : String(e)}`);
                throw e;
            }

            const { checked, failed } = result;
            if (failed > 0) {
                ctx.logger?.error(`Checked ${checked} stuck analysis processes, ${failed} failed.`);
                throw new Error(`${failed} stuck analysis process checks failed.`);
            }

            if (checked > 0) {
                ctx.logger?.debug(`Checked ${checked} stuck analysis processes.`);
            }
        },
    });
}
