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
