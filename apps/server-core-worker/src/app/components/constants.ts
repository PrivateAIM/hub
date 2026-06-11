/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * An in-progress build/distribution whose analysis row has not been touched
 * for longer than this is considered orphaned (e.g. the worker died mid-process):
 * the check command then yields a FAILED verdict so the process can be retriggered.
 */
export const ANALYSIS_PROCESS_STALE_THRESHOLD_MS = 15 * 60 * 1000;
