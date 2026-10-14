/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type DataSourceLockOptions = {
    /**
     * How long to wait for the lock, in milliseconds, before throwing a
     * `DatabaseLockError` instead of running the callback unlocked.
     *
     * default: 60_000
     */
    timeout?: number
};
