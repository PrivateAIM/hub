/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';

/**
 * An in-progress build/distribution whose analysis row has not been written
 * for longer than this is considered orphaned (e.g. the worker died). Running
 * workers keep the row fresh with progress events and a heartbeat (every 5 min).
 */
export const ANALYSIS_PROCESS_STALE_THRESHOLD_MS = 15 * 60 * 1000;

/**
 * A PROGRESS event that changes nothing stamps the row's `updatedAt` only when
 * the last write is older than this, so a heartbeat keeps the row fresh
 * without a write per progress event. Must stay well under the worker's
 * heartbeat interval (5 min) and the stale threshold (15 min).
 */
export const ANALYSIS_PROCESS_HEARTBEAT_STAMP_MS = 60 * 1000;

export function isProcessStatusInProgress(status: `${ProcessStatus}` | null | undefined): boolean {
    return status === ProcessStatus.STARTING ||
        status === ProcessStatus.STARTED;
}

/**
 * True when a row last written at `updatedAt` has been untouched for longer
 * than the stale threshold. An unparsable value is never stale.
 */
export function isProcessStale(updatedAt: string, now: Date = new Date()): boolean {
    const updatedAtMs = new Date(updatedAt).getTime();

    if (Number.isNaN(updatedAtMs)) {
        return false;
    }

    return now.getTime() - updatedAtMs > ANALYSIS_PROCESS_STALE_THRESHOLD_MS;
}

/**
 * True when the row's last write is old enough that a no-op PROGRESS should
 * stamp `updatedAt` (heartbeat). An unparsable value is stamped.
 */
export function isProcessHeartbeatDue(updatedAt: string, now: Date = new Date()): boolean {
    const updatedAtMs = new Date(updatedAt).getTime();

    if (Number.isNaN(updatedAtMs)) {
        return true;
    }

    return now.getTime() - updatedAtMs > ANALYSIS_PROCESS_HEARTBEAT_STAMP_MS;
}

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
