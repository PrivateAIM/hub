/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Event } from '@privateaim/telemetry-kit';
import { FakeEntityRepository } from '@privateaim/server-test-kit';
import type { EventDeleteExpiredOptions, IEventRepository } from '../../../../../src/core/entities/index.ts';

export type FakeEventRow = Pick<Event, 'id' | 'expiring' | 'expiresAt'>;

/**
 * In-memory {@see IEventRepository} for the retention sweep. Holds its own rows
 * so `deleteExpired` can be exercised without a database, and records every
 * call so the cleaner's delegation can be asserted.
 */
export class FakeEventRepository extends FakeEntityRepository<Event> implements IEventRepository {
    rows: FakeEventRow[] = [];

    readonly deleteExpiredCalls: { now: string, options?: EventDeleteExpiredOptions }[] = [];

    async deleteExpired(now: string, options?: EventDeleteExpiredOptions): Promise<number> {
        this.deleteExpiredCalls.push({ now, options });

        const before = this.rows.length;
        this.rows = this.rows.filter(
            (row) => !(row.expiring && row.expiresAt !== null && row.expiresAt < now),
        );

        return before - this.rows.length;
    }
}
