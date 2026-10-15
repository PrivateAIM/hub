/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * How often a running build/distribution re-emits its last progress.
 * server-core judges an in-progress process stale once its analysis row is
 * untouched for 15 minutes (`ANALYSIS_PROCESS_STALE_THRESHOLD_MS` in
 * server-core), so this must stay well below that.
 */
export const ANALYSIS_PROCESS_HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;

/**
 * The heartbeat stops once no real progress arrived for this long, so a hung
 * docker stream is judged stale (and recoverable) instead of being kept fresh
 * forever.
 *
 * ponytail: a single docker step (build layer, push) silent for longer than
 * this is treated as hung, even if it would have finished.
 */
export const ANALYSIS_PROCESS_HEARTBEAT_MAX_SILENCE_MS = 2 * 60 * 60 * 1000;
