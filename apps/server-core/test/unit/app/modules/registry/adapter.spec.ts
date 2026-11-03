/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import type { RegistryProject } from '@privateaim/core-kit';
import { DataSource } from 'typeorm';
import type { Repository } from 'typeorm';
import {
    afterAll,
    afterEach,
    beforeAll,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { RegistryEntity, RegistryProjectEntity } from '../../../../../src/adapters/database/entities/index.ts';
import { DatabaseInjectionKey } from '../../../../../src/app/modules/database/index.ts';
import { RegistryManagerAdapter } from '../../../../../src/app/modules/registry/index.ts';
import { createTestDatabaseApplication } from '../../../../app';
import { RegistryCommand } from '../../../../../src/core/domains/index.ts';

describe('RegistryManagerAdapter relink dispatch', () => {
    it('should use the migration lock key and release its runner', async () => {
        const dataSource = new DataSource({ type: 'postgres' });
        const runner = dataSource.createQueryRunner();
        const query = vi.spyOn(runner, 'query').mockResolvedValue([{ acquired: true, released: true }]);
        const release = vi.spyOn(runner, 'release').mockResolvedValue();
        const manager = new RegistryManagerAdapter({ dataSource });

        vi.spyOn(dataSource, 'createQueryRunner').mockReturnValue(runner);

        const result = await manager.withRegistryLock('registry-id', async () => {
            expect(query).toHaveBeenCalledTimes(1);
            expect(release).not.toHaveBeenCalled();

            return 'saved';
        });

        expect(result).toBe('saved');
        expect(query).toHaveBeenCalledTimes(2);
        expect(query.mock.calls.map((call) => call[1])).toEqual([
            ['server-core:registry-migration:registry-id'],
            ['server-core:registry-migration:registry-id'],
        ]);
        expect(release).toHaveBeenCalledOnce();
    });

    it('should reserve a new project name under the registry migration lock', async () => {
        const dataSource = new DataSource({ type: 'postgres' });
        const runner = dataSource.createQueryRunner();
        const query = vi.spyOn(runner, 'query').mockResolvedValue([{ acquired: true, released: true }]);
        const release = vi.spyOn(runner, 'release').mockResolvedValue();
        const repository = dataSource.getRepository(RegistryProjectEntity);
        const entity = Object.assign(new RegistryProjectEntity(), { registryId: 'registry-id', externalName: 'new-name' });

        vi.spyOn(dataSource, 'createQueryRunner').mockReturnValue(runner);
        vi.spyOn(repository, 'create').mockReturnValue(entity);
        vi.spyOn(repository, 'save').mockImplementation(async () => {
            expect(query).toHaveBeenCalledTimes(1);
            expect(release).not.toHaveBeenCalled();

            return entity;
        });

        const manager = new RegistryManagerAdapter({ dataSource });

        expect(await manager.createProject(entity)).toBe(entity);
        expect(query.mock.calls[0][1]).toEqual(['server-core:registry-migration:registry-id']);
        expect(repository.save).toHaveBeenCalledOnce();
        expect(release).toHaveBeenCalledOnce();
    });

    it('should dispatch the active source and a separate required target name', async () => {
        const dispatch = vi.fn(async () => {});
        const manager = new RegistryManagerAdapter({
            dataSource: new DataSource({ type: 'postgres' }),
            registryComponentDispatcher: { dispatch },
        });
        const project = {
            id: 'source-id',
            registryId: 'registry-id',
            externalName: 'source-name',
            accountId: 'source-account',
        } as RegistryProject;

        await manager.relinkProject(project, 'target-name');

        expect(dispatch).toHaveBeenCalledExactlyOnceWith(RegistryCommand.PROJECT_RELINK, {
            id: project.id,
            registryId: project.registryId,
            externalName: 'source-name',
            accountId: 'source-account',
            targetExternalName: 'target-name',
        }, {});
        expect(project.externalName).toBe('source-name');
    });
});

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

        // Spec files run sequentially in one database per vitest worker, and
        // this spec asserts on the WHOLE table ("no registry exists"), so
        // start from an empty one rather than trusting every earlier spec.
        await repository.remove(await repository.find());
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
