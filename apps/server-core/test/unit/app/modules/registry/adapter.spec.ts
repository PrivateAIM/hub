/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import type { DataSource, Repository } from 'typeorm';
import {
    afterAll,
    afterEach,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { RegistryEntity } from '../../../../../src/adapters/database/entities/index.ts';
import { DatabaseInjectionKey } from '../../../../../src/app/modules/database/index.ts';
import { RegistryManagerAdapter } from '../../../../../src/app/modules/registry/index.ts';
import { createTestDatabaseApplication } from '../../../../app';

describe('RegistryManagerAdapter', () => {
    const suite = createTestDatabaseApplication();

    let dataSource: DataSource;
    let repository: Repository<RegistryEntity>;
    let manager: RegistryManagerAdapter;

    beforeAll(async () => {
        await suite.setup();

        dataSource = suite.container.resolve(DatabaseInjectionKey.DataSource);
        repository = dataSource.getRepository(RegistryEntity);
        manager = new RegistryManagerAdapter({ dataSource });
    });

    afterEach(async () => {
        await repository.remove(await repository.find());
    });

    afterAll(async () => {
        await suite.teardown();
    });

    async function createRegistry(createdAt: string): Promise<RegistryEntity> {
        const entity = await repository.save(repository.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            host: faker.internet.domainName(),
        }));

        // `createdAt` is filled by the CreateDateColumn on insert; the ordering
        // this asserts needs values that are far enough apart to survive a
        // one-second datetime resolution.
        await repository.update(entity.id, { createdAt });

        return entity;
    }

    describe('findDefaultRegistryId', () => {
        it('should return null when no registry exists', async () => {
            expect(await manager.findDefaultRegistryId()).toBeNull();
        });

        it('should return the only registry', async () => {
            const registry = await createRegistry('2020-01-01T00:00:00.000Z');

            expect(await manager.findDefaultRegistryId()).toBe(registry.id);
        });

        it('should break a createdAt tie deterministically', async () => {
            // `created_at` resolution is coarse enough to tie (a seeder loop, an
            // import, a one-second datetime column). Ordering by it alone would
            // then leave the row the database returns up to plan or index order,
            // so two nodes registered minutes apart could land on different
            // registries — the very thing the oldest-first rule exists to avoid.
            // The tie goes to the alphabetically first name, not to an arbitrary
            // uuid: the choice stays predictable to whoever configured them.
            const first = await createRegistry('2020-01-01T00:00:00.000Z');
            const second = await createRegistry('2020-01-01T00:00:00.000Z');

            const expected = [first, second]
                .sort((a, b) => a.name.localeCompare(b.name))[0].id;

            expect(await manager.findDefaultRegistryId()).toBe(expected);
            expect(await manager.findDefaultRegistryId()).toBe(expected);
        });

        it('should return the oldest registry when several exist', async () => {
            const oldest = await createRegistry('2020-01-01T00:00:00.000Z');
            await createRegistry('2021-01-01T00:00:00.000Z');
            await createRegistry('2022-01-01T00:00:00.000Z');

            // A node created without an explicit registry must still end up
            // connected. Picking the oldest keeps the choice stable: adding a
            // registry later never re-points what new nodes connect to.
            expect(await manager.findDefaultRegistryId()).toBe(oldest.id);
        });
    });
});
