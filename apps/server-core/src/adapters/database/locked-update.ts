/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    DataSource,
    EntityTarget,
    FindOptionsWhere,
    ObjectLiteral,
    SaveOptions,
} from 'typeorm';

/**
 * Read one row under a write lock, let `fn` check and mutate it, and save it —
 * in one transaction. A status transition then evaluates its guard on the row
 * as it is now, not on an earlier read: two replicas cannot both pass a
 * `canStart`, and a late worker event cannot write an older status back
 * (`save()` diffs against the database, so a stale in-memory status is
 * written as if it were a change).
 *
 * Not `repository.update()`: that bypasses the subscribers, which publish the
 * realtime and audit domain events.
 *
 * `fn` returns true to save, false to leave the row untouched; a throw rolls
 * back. It is synchronous on purpose — nothing may be awaited (e.g. a
 * dispatch) while the lock is held; dispatch after this resolves, i.e. after
 * the commit. Resolves the saved row, or null when the row is missing or
 * `fn` declined.
 *
 * better-sqlite3 has no row locks (typeorm throws
 * LockNotSupportedOnGivenDriverError), so it runs unlocked — and is NOT race
 * safe: its one shared query runner nests a concurrent transaction as a
 * savepoint instead of serializing it, so two in-process callers can both
 * pass `fn`'s guard, and one's rollback can undo the other's commit. No
 * better than the plain save() it replaces; accepted for a dev/test driver.
 */
export async function updateLockedEntity<T extends ObjectLiteral>(
    dataSource: DataSource,
    target: EntityTarget<T>,
    where: FindOptionsWhere<T>,
    fn: (entity: T) => boolean,
    options?: SaveOptions,
): Promise<T | null> {
    return dataSource.transaction(async (manager) => {
        const entity = await manager.findOne(target, {
            where,
            ...(dataSource.options.type === 'better-sqlite3' ? {} : { lock: { mode: 'pessimistic_write' } }),
        });

        if (!entity || !fn(entity)) {
            return null;
        }

        return manager.save(target, entity, options);
    });
}
