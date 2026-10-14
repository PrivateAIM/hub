/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { withDataSourceLock } from '@privateaim/server-db-kit';
import { DataSource } from 'typeorm';
import type { QueryRunner, ReplicationMode } from 'typeorm';
import { DatabaseLockError, readDataSourceOptionsFromEnv } from 'typeorm-extension';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { DataSourceOptionsBuilder } from '../../../../src/app/modules/database/index.ts';

class RecordingDataSource extends DataSource {
    queryRunners = 0;

    override createQueryRunner(mode?: ReplicationMode) : QueryRunner {
        this.queryRunners++;
        return super.createQueryRunner(mode);
    }
}

const type = readDataSourceOptionsFromEnv()?.type;
const lockable = type === 'mysql' || type === 'postgres';

function wait(ms: number) : Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * The boot-time migration (and the harbor setup) run inside
 * `withDataSourceLock`. Each call takes its own query runner and the lock is
 * arbitrated per session, so one DataSource is enough to model two replicas.
 * The lock mechanics themselves are typeorm-extension's and tested there;
 * this pins that hub's wrapper actually serializes against a real server and
 * keeps its hands off the one shared better-sqlite3 runner.
 */
describe('withDataSourceLock', () => {
    let dataSource: RecordingDataSource;

    beforeAll(async () => {
        dataSource = new RecordingDataSource(new DataSourceOptionsBuilder().buildWithEnv());
        await dataSource.initialize();
    });

    afterAll(async () => {
        if (dataSource?.isInitialized) {
            await dataSource.destroy();
        }
    });

    it('should serialize two holders of the same lock', async () => {
        const name = `test:${randomUUID()}`;
        const events: string[] = [];

        const run = (id: string) => withDataSourceLock(dataSource, name, async () => {
            events.push(`${id}:start`);
            // a real round-trip on another pooled connection, as a migration makes
            await dataSource.query('SELECT 1');
            await wait(200);
            events.push(`${id}:end`);
        });

        await Promise.all([run('a'), run('b')]);

        if (!lockable) {
            // no lock and no runner: one database file per container
            expect(events).toEqual(['a:start', 'b:start', 'a:end', 'b:end']);
            expect(dataSource.queryRunners).toEqual(0);
            return;
        }

        // whichever started first ends before the other starts
        const first = events[0].split(':')[0];
        const second = first === 'a' ? 'b' : 'a';
        expect(events).toEqual([`${first}:start`, `${first}:end`, `${second}:start`, `${second}:end`]);
    });

    it.skipIf(!lockable)('should throw rather than run unlocked when the wait times out', async () => {
        const name = `test:${randomUUID()}`;
        let ran = false;

        await withDataSourceLock(dataSource, name, async () => {
            await expect(withDataSourceLock(dataSource, name, async () => {
                ran = true;
            }, { timeout: 200 })).rejects.toThrow(DatabaseLockError);
        });

        expect(ran).toBe(false);

        // and the holder released it on its way out
        await expect(withDataSourceLock(dataSource, name, async () => 'free', { timeout: 0 })).resolves.toEqual('free');
    });

    it.skipIf(!lockable)('should not hold the lock across names', async () => {
        const name = `test:${randomUUID()}`;

        await withDataSourceLock(dataSource, name, async () => {
            await expect(withDataSourceLock(dataSource, `${name}:other`, async () => 'other', { timeout: 0 }))
                .resolves.toEqual('other');
        });
    });
});
