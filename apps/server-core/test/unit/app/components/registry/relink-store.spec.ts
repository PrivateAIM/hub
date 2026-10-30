/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ProcessStatus } from '@privateaim/kit';
import Database from 'better-sqlite3';
import { DataSource } from 'typeorm';
import { 
    afterEach, 
    beforeEach, 
    describe, 
    expect, 
    it, 
} from 'vitest';
import { RegistryEntity } from '../../../../../src/adapters/database/entities/registry.ts';
import { RegistryProjectEntity } from '../../../../../src/adapters/database/entities/registry-project.ts';
import { AnalysisEntity } from '../../../../../src/adapters/database/entities/analysis.ts';
import { ProjectEntity } from '../../../../../src/adapters/database/entities/project.ts';
import { DataSourceOptionsBuilder } from '../../../../../src/app/modules/database/options.ts';
import { RegistryProjectRelinkStore } from '../../../../../src/app/components/registry/handlers/project/relink/store.ts';
import { RegistryProjectRelinkHandler } from '../../../../../src/app/components/registry/handlers/project/relink.ts';
import { FakeMigration } from './fake-migration.ts';
import type { RegistryProjectRelinkTarget } from '../../../../../src/app/components/registry/handlers/project/relink/types.ts';

const target: RegistryProjectRelinkTarget = {
    externalName: 'target', 
    externalId: '11', 
    accountId: '21', 
    accountName: 'new-robot', 
    accountSecret: 'new-secret',
};

describe('RegistryProjectRelinkStore (SQLite atomic persistence)', () => {
    let dataSource: DataSource;
    let store: RegistryProjectRelinkStore;
    let id: string;
    let registryId: string;

    beforeEach(async () => {
        dataSource = new DataSource(new DataSourceOptionsBuilder().buildWith({
            type: 'better-sqlite3', 
            database: ':memory:', 
            synchronize: true,
            driver: Database, 
        }));
        await dataSource.initialize();
        store = new RegistryProjectRelinkStore(async () => dataSource);

        const registry = await dataSource.getRepository(RegistryEntity).save({
            name: 'registry', 
            host: 'https://harbor.test', 
            accountName: 'admin', 
            accountSecret: 'admin-secret',
        });

        registryId = registry.id;

        const project = await dataSource.getRepository(RegistryProjectEntity).save({
            name: 'node',
            registryId,
            externalName: 'source',
            externalId: '10',
            accountId: '20',
            accountName: 'old-robot',
            accountSecret: 'old-secret',
            realmId: 'realm',
            public: false,
        });

        id = project.id;
    });

    afterEach(async () => {
        if (dataSource?.isInitialized) {
            await dataSource.destroy();
        }
    });

    it('explicitly loads both source and registry secrets and saves all binding fields together', async () => {
        const source = await store.load(id);

        expect(source?.project.accountSecret).toBe('old-secret');
        expect(source?.registry.accountSecret).toBe('admin-secret');
        await store.withLock(registryId, async () => store.cutover(source!, target));
        expect((await store.load(id))?.project).toMatchObject(target);
    });

    it('rejects a locally reserved destination before any remote migration writes', async () => {
        const source = await store.load(id);

        await dataSource.getRepository(RegistryProjectEntity).save({
            name: 'reserved', 
            registryId, 
            externalName: 'target', 
            externalId: null, 
            realmId: 'other-realm',
        });

        const migration = new FakeMigration();
        const handler = new RegistryProjectRelinkHandler({ store, migration });

        await expect(handler.handle({
            id, 
            registryId, 
            externalName: 'source', 
            targetExternalName: 'target', 
        }))
            .rejects.toThrow('reserved by another local registry project');
        expect(migration.calls).toEqual([]);
        expect((await store.load(id))?.project).toEqual(source?.project);
    });

    it('allows a destination name reserved only by the source row itself', async () => {
        const source = await store.load(id);

        await expect(store.assertTargetAvailable(source!, 'source')).resolves.toBeUndefined();
        await expect(store.assertTargetAvailable(source!, 'target')).resolves.toBeUndefined();
    });

    it('rolls back a uniqueness/save failure without changing source credentials', async () => {
        const source = await store.load(id);

        await dataSource.getRepository(RegistryProjectEntity).save({
            name: 'other', 
            registryId, 
            externalName: 'target', 
            externalId: '12', 
            realmId: 'realm',
        });
        await expect(store.cutover(source!, target)).rejects.toThrow();
        expect((await store.load(id))?.project).toMatchObject({
            externalName: 'source', 
            externalId: '10', 
            accountSecret: 'old-secret', 
        });
    });

    it('checks the source binding again inside the transaction', async () => {
        const source = await store.load(id);

        await dataSource.getRepository(RegistryProjectEntity).update(id, { accountSecret: 'changed' });
        await expect(store.cutover(source!, target)).rejects.toThrow('changed during migration');
        expect((await store.load(id))?.project).toMatchObject({ externalName: 'source', accountSecret: 'changed' });
    });

    it('preserves unrelated metadata changed during the remote copy', async () => {
        const source = await store.load(id);

        await dataSource.getRepository(RegistryProjectEntity).update(id, { name: 'renamed-locally', realmId: 'another-realm' });
        await store.cutover(source!, target);
        expect((await store.load(id))?.project).toMatchObject({
            ...target, 
            name: 'renamed-locally', 
            realmId: 'another-realm', 
        });
    });

    it('checks registry connection changes before cutover', async () => {
        const source = await store.load(id);

        await dataSource.getRepository(RegistryEntity).update(registryId, { host: 'https://other.test' });
        await expect(store.cutover(source!, target)).rejects.toThrow('changed during migration');
        expect((await store.load(id))?.project.accountSecret).toBe('old-secret');
    });

    it('refuses active distributions at both the initial check and cutover', async () => {
        const source = await store.load(id);
        const project = await dataSource.getRepository(ProjectEntity).save({ name: 'project', realmId: 'realm' });

        await dataSource.getRepository(AnalysisEntity).save({
            name: 'analysis', 
            realmId: 'realm', 
            projectId: project.id, 
            registryId, 
            distributionStatus: ProcessStatus.STARTED, 
        });
        await expect(store.assertIdle(source!)).rejects.toThrow('active analysis distribution');
        await expect(store.cutover(source!, target)).rejects.toThrow('active analysis distribution');
        expect((await store.load(id))?.project.accountSecret).toBe('old-secret');
    });
});
