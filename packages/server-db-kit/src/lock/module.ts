/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DataSource } from 'typeorm';
import { withDatabaseLock } from 'typeorm-extension';
import type { DataSourceLockOptions } from './types.ts';

export const DATA_SOURCE_LOCK_TIMEOUT = 60_000;

/**
 * Run `fn` while holding the named advisory lock, so that of several
 * replicas booting at once only one runs it at a time — the others wait,
 * then find nothing left to do.
 *
 * The lock is SESSION scoped, so it takes a dedicated query runner for the
 * whole call; the callback's own queries go through other pooled
 * connections, so the pool needs at least two.
 *
 * better-sqlite3 runs the callback unlocked and creates no runner: one
 * database file per container means a second replica cannot reach it, and
 * `BetterSqlite3Driver.createQueryRunner` hands out ONE shared runner, so
 * releasing it here would release it under whatever else is using it. That
 * is why the driver is checked before a runner is created, rather than
 * passing `strict: false` to `withDatabaseLock`.
 *
 * The name must stay STABLE across releases: a renamed lock is a different
 * mutex, so during a rolling upgrade an outgoing and an incoming replica
 * would each hold their own.
 */
export async function withDataSourceLock<T>(
    dataSource: DataSource,
    name: string,
    fn: () => Promise<T>,
    options: DataSourceLockOptions = {},
) : Promise<T> {
    if (dataSource.options.type === 'better-sqlite3') {
        return fn();
    }

    const queryRunner = dataSource.createQueryRunner();

    try {
        return await withDatabaseLock(queryRunner, name, fn, { timeout: options.timeout ?? DATA_SOURCE_LOCK_TIMEOUT });
    } finally {
        await queryRunner.release();
    }
}
