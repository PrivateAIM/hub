/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Every 5 minutes after the pass at start. A process becomes stale after 15
 * minutes, so a stuck one is checked within 20 at the latest.
 */
export const ANALYSIS_RECONCILER_SCHEDULE = '*/5 * * * *';
