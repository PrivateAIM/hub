/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import { ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS, ANALYSIS_PROCESS_HEARTBEAT_MAX_SILENCE_MS } from './constants';
import type { Heartbeat } from './types';

/**
 * Run `beat` on an interval until `stop()` is called.
 * A long single step (one docker build layer, one push) emits no progress,
 * and server-core would judge the process stale; the beat keeps its row fresh.
 * Beats are skipped once `touch()` (real progress) has not been called for
 * ANALYSIS_PROCESS_HEARTBEAT_MAX_SILENCE_MS, so a hung stream goes stale.
 *
 * A failed beat is logged, not thrown: the next one retries, and a worker
 * that can no longer publish at all should be judged stale.
 */
export function startHeartbeat(
    beat: () => unknown,
    logger?: Logger,
    intervalMs: number = ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS,
    maxSilenceMs: number = ANALYSIS_PROCESS_HEARTBEAT_MAX_SILENCE_MS,
): Heartbeat {
    let touchedAt = Date.now();
    const timer = setInterval(() => {
        if (Date.now() - touchedAt > maxSilenceMs) {
            return;
        }

        Promise.resolve()
            .then(beat)
            .catch((e) => logger?.warn({ message: 'Heartbeat failed', error: e }));
    }, intervalMs);

    return {
        touch: () => {
            touchedAt = Date.now();
        },
        stop: () => clearInterval(timer),
    };
}
