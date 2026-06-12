/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ANALYSIS_PROCESS_STALE_THRESHOLD_MS } from './constants';

/**
 * Determine if an in-progress analysis process (build/distribution) is stale,
 * i.e. its entity has not been updated for longer than the given threshold.
 * Progress events touch the entity, so a recently updated row means the
 * process is still alive.
 *
 * @param updatedAt
 * @param thresholdMs
 */
export function isAnalysisProcessStale(
    updatedAt: Date | string,
    thresholdMs: number = ANALYSIS_PROCESS_STALE_THRESHOLD_MS,
): boolean {
    const updatedAtMs = new Date(updatedAt).getTime();
    if (Number.isNaN(updatedAtMs)) {
        return false;
    }

    return Date.now() - updatedAtMs > thresholdMs;
}
