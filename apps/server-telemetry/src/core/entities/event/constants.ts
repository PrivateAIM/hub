/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Rows removed per statement by the event retention sweep. Steady state removes
 * a trickle, but the first sweep after a retention change — or the day a full
 * retention window first matures — can match millions of rows, and the cleaner
 * runs on every replica. A single unbounded statement would then be one long
 * transaction; batching keeps each statement bounded, and the sweep still
 * drains by looping.
 */
export const EVENT_RETENTION_SWEEP_BATCH_SIZE = 1000;

/**
 * Days a bus-ingested event row is kept before the sweep drops it. `0` keeps
 * rows forever. Matches the previous hard-coded `WEEK_IN_MS` window for the
 * entity bridge; the two master-image producers previously used 24h and now
 * share this default.
 */
export const EVENT_RETENTION_DAYS_DEFAULT = 7;
