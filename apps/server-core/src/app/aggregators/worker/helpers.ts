/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';

/**
 * A worker's STARTED/PROGRESS event must not resurrect a process that has
 * already ended (late or redelivered message). Only the command path, which
 * sets STARTING, may leave a terminal status.
 */
export function isProcessStatusTerminal(status: `${ProcessStatus}` | null | undefined): boolean {
    return status === ProcessStatus.EXECUTED ||
        status === ProcessStatus.FAILED ||
        status === ProcessStatus.STOPPED;
}

/**
 * A check verdict judges the snapshot the worker read. If the row has been
 * written since (a new start, a finished run), the verdict is about a past
 * state and must not overwrite the present one — e.g. a FAILED for an
 * orphaned build arriving after a rebuild was started.
 *
 * Any write bumps `updatedAt`, not only a status transition — a node-progress
 * recalc or an approval during the check drops the verdict too, silently.
 * Accepted: a dropped verdict leaves the row as it was; the check is re-run.
 *
 * Without `checkedAt` (a worker from before this field, during a rolling
 * upgrade) the verdict is applied as before.
 *
 * Both values come from the same `updated_at` column through the same
 * transformer, so an untouched row compares equal at whatever precision the
 * column stores (mysql may truncate fractional seconds — on both sides);
 * equal counts as fresh.
 */
export function isCheckVerdictStale(checkedAt: string | undefined, updatedAt: string): boolean {
    if (!checkedAt) {
        return false;
    }

    return new Date(updatedAt).getTime() > new Date(checkedAt).getTime();
}
