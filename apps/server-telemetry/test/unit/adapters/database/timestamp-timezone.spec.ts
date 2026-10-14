/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import { readDataSourceOptionsFromEnv } from 'typeorm-extension';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { EventEntity } from '../../../../src/adapters/database/entities/event.ts';
import { DataSourceOptionsBuilder } from '../../../../src/app/modules/database/index.ts';

const env = readDataSourceOptionsFromEnv();
const type = env?.type;

type Stamp = {
    /** `createdAt` as read back, in ms since the epoch. */
    read: number,
    /** Whether a bound `Date` a minute ago / ahead brackets the stamped value. */
    bracketed: boolean
};

/**
 * `created_at` / `updated_at` are zone-less. The database stamps them in its
 * SESSION timezone, the driver reads them in the PROCESS timezone, and a
 * bound `Date` is written in the process timezone too — so the three only
 * agreed when every clock ran in UTC (#1900). Here none does: the database
 * default is UTC+14 and the Node process runs at UTC-9, so any unpinned half
 * is off by hours.
 *
 * The database default only applies to NEW sessions, which is why every
 * check opens a pool of its own. The control pool, built without the pin,
 * proves the environment really is skewed, so the main assertion cannot
 * pass vacuously.
 */
describe.skipIf(type !== 'mysql' && type !== 'postgres')('adapters/database (utc timestamps)', () => {
    let admin: DataSource;
    let previousZone: string | undefined;
    // postgres: the database's own `timezone` setting, if it had one
    let previousDatabaseZone: string | undefined;
    const previousTZ = process.env.TZ;

    async function stamp(options: DataSourceOptions) : Promise<Stamp> {
        const dataSource = new DataSource(options);
        await dataSource.initialize();
        try {
            const repository = dataSource.getRepository(EventEntity);
            const saved = await repository.save(repository.create({
                scope: 'entity',
                name: `tz-${randomUUID()}`.slice(0, 64),
                refType: 'test',
            }));

            try {
                const read = await repository.findOneByOrFail({ id: saved.id });
                const now = Date.now();
                const count = await repository.createQueryBuilder('event')
                    .where('event.id = :id', { id: saved.id })
                    .andWhere('event.createdAt > :from', { from: new Date(now - 60_000) })
                    .andWhere('event.createdAt < :to', { to: new Date(now + 60_000) })
                    .getCount();

                return { read: Date.parse(read.createdAt), bracketed: count === 1 };
            } finally {
                await repository.delete({ id: saved.id });
            }
        } finally {
            await dataSource.destroy();
        }
    }

    beforeAll(async () => {
        // fixed offset, no DST (POSIX sign: Etc/GMT+9 is UTC-9)
        process.env.TZ = 'Etc/GMT+9';

        admin = new DataSource(new DataSourceOptionsBuilder().buildWith(env));
        await admin.initialize();

        if (type === 'postgres') {
            const rows: { setting: string }[] = await admin.query(
                'SELECT unnest(s.setconfig) AS setting FROM pg_db_role_setting s ' +
                'JOIN pg_database d ON d.oid = s.setdatabase ' +
                'WHERE d.datname = current_database() AND s.setrole = 0',
            );
            const setting = rows.find((row) => row.setting.toLowerCase().startsWith('timezone='));
            previousDatabaseZone = setting?.setting.slice('timezone='.length);

            await admin.query(`ALTER DATABASE "${env.database}" SET timezone TO 'Pacific/Kiritimati'`);
        } else {
            const [row] = await admin.query('SELECT @@GLOBAL.time_zone AS zone');
            previousZone = row.zone;
            await admin.query('SET GLOBAL time_zone = \'+14:00\'');
        }
    });

    afterAll(async () => {
        if (typeof previousTZ === 'undefined') {
            delete process.env.TZ;
        } else {
            process.env.TZ = previousTZ;
        }

        if (!admin) {
            return;
        }

        if (type === 'postgres') {
            // restore a setting the database had rather than dropping it
            if (typeof previousDatabaseZone === 'undefined') {
                await admin.query(`ALTER DATABASE "${env.database}" RESET timezone`);
            } else {
                await admin.query(`ALTER DATABASE "${env.database}" SET timezone TO '${previousDatabaseZone}'`);
            }
        } else {
            await admin.query(`SET GLOBAL time_zone = '${previousZone ?? 'SYSTEM'}'`);
        }

        await admin.destroy();
    });

    it('should shift without the pin (environment check)', async () => {
        expect(new Date().getTimezoneOffset()).toEqual(9 * 60);

        // what the builder produced before the pin: the raw env options
        const before = Date.now();
        const { read, bracketed } = await stamp({ ...env, entities: [EventEntity] });

        expect(Math.abs(read - before)).toBeGreaterThan(3_600_000);
        expect(bracketed).toBe(false);
    });

    it('should stamp, read and compare the true instant', async () => {
        const before = Date.now();
        const { read, bracketed } = await stamp(new DataSourceOptionsBuilder().buildWith(env));

        expect(Math.abs(read - before)).toBeLessThan(60_000);
        expect(bracketed).toBe(true);
    });
});
