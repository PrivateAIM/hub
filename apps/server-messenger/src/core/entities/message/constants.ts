/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * Rows removed per statement by the mailbox TTL sweep. The sweep runs every
 * minute on every replica, and a backlog — a paused consumer, a burst of
 * undelivered analysis traffic — can leave millions of rows past their expiry.
 * A single unbounded DELETE would then be one long transaction, issued
 * concurrently by every replica. Batching keeps each statement bounded; the
 * sweep still drains by looping.
 */
export const MESSAGE_SWEEP_BATCH_SIZE = 1000;
