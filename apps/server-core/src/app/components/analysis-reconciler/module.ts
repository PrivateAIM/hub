/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ScheduledTask } from 'node-cron';
import cron from 'node-cron';
import { ANALYSIS_RECONCILER_SCHEDULE } from './constants.ts';
import type { AnalysisReconcilerComponent, AnalysisReconcilerComponentContext } from './types.ts';

/**
 * Re-checks stuck builds/distributions (F14): one pass at start, then on
 * ANALYSIS_RECONCILER_SCHEDULE.
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
export function createAnalysisReconcilerComponent(ctx: AnalysisReconcilerComponentContext): AnalysisReconcilerComponent {
    let task: ScheduledTask | undefined;
    let stopped = false;
    let lastSuccessAt: number | undefined;
    let runningSince: number | undefined;

    // ComponentsModule starts components fire-and-forget without a catch,
    // so start() must never reject. The next tick simply retries.
    const execute = async () => {
        runningSince = Date.now();
        try {
            const { checked, failed } = await ctx.reconciler.reconcile();

            if (failed > 0) {
                ctx.logger?.error(`Checked ${checked} stuck analysis processes, ${failed} failed.`);
            } else {
                lastSuccessAt = Date.now();
                if (checked > 0) {
                    ctx.logger?.info(`Checked ${checked} stuck analysis processes.`);
                }
            }
        } catch (e) {
            ctx.logger?.error(`Reconciling stuck analysis processes failed: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            runningSince = undefined;
        }
    };

    return {
        async start() {
            await execute();

            if (stopped) {
                return;
            }

            task = cron.schedule(ANALYSIS_RECONCILER_SCHEDULE, async () => {
                await execute();
            }, { noOverlap: true });
        },
        async stop() {
            stopped = true;

            if (task) {
                await task.stop();
                task = undefined;
            }
        },
        status: () => ({ lastSuccessAt, runningSince }),
    };
}
