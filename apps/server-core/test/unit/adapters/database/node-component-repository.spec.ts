/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import type { Node } from '@privateaim/core-kit';
import { EntityNotFoundError } from '@privateaim/errors';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import type { DataSource } from 'typeorm';
import { readDataSourceOptionsFromEnv } from 'typeorm-extension';
import { DatabaseInjectionKey } from '../../../../src/app/modules/database/index.ts';
import type { INodeComponentRepository, INodeRepository } from '../../../../src/core/index.ts';
import { createTestDatabaseApplication } from '../../../app/index.ts';

const type = readDataSourceOptionsFromEnv()?.type;
// better-sqlite3 has no row locks and one shared connection: a second
// concurrent transaction fails to start instead of waiting.
const lockable = type === 'mysql' || type === 'postgres';

function highUUID(counter: number): string {
    return `ffffffff-ffff-4fff-8fff-${counter.toString(16).padStart(12, '0')}`;
}

function minutesAgo(minutes: number): string {
    return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

/**
 * The adapter half of node status reporting: the snapshot replaces a node's
 * component set, a component report upserts one row, and both serialize on
 * the node row — so they run against a real database.
 */
describe('node component repository', () => {
    const suite = createTestDatabaseApplication();
    let dataSource: DataSource;
    let nodeRepository: INodeRepository;
    let repository: INodeComponentRepository;

    beforeAll(async () => {
        await suite.setup();
        dataSource = suite.container.resolve(DatabaseInjectionKey.DataSource);
        nodeRepository = suite.container.resolve(DatabaseInjectionKey.NodeRepository);
        repository = suite.container.resolve(DatabaseInjectionKey.NodeComponentRepository);
    });

    afterAll(async () => {
        await suite.teardown();
    });

    async function createNode(data: Partial<Node> = {}): Promise<Node> {
        return nodeRepository.save(nodeRepository.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            realmId: faker.string.uuid(),
            ...data,
        }));
    }

    async function names(nodeId: string): Promise<string[]> {
        const rows = await repository.findManyBy({ nodeId });

        return rows.map((row) => row.name).sort();
    }

    it('should delete the components a snapshot no longer names', async () => {
        const node = await createNode();
        const reportedAt = new Date().toISOString();

        await repository.replaceForNode(node.id, [
            { name: 'a', report: { name: 'a', status: 'ok' } },
            { name: 'b', report: { name: 'b', status: 'ok' } },
        ], reportedAt);

        expect(await names(node.id)).toEqual(['a', 'b']);

        const result = await repository.replaceForNode(node.id, [
            { name: 'a', report: { name: 'a', status: 'error' } },
        ], reportedAt);

        expect(result.map((row) => row.name)).toEqual(['a']);
        expect(await names(node.id)).toEqual(['a']);
    });

    it('should delete a reported component the next snapshot leaves out', async () => {
        const node = await createNode();
        const reportedAt = new Date().toISOString();

        const storage = await repository.upsertForNode(node.id, {
            name: 'storage',
            report: { status: 'ok', version: '0.5.1' },
        }, reportedAt);

        expect(storage.nodeId).toEqual(node.id);
        expect(storage.version).toEqual('0.5.1');

        await repository.replaceForNode(node.id, [
            { name: 'po', report: { name: 'po', status: 'ok' } },
        ], reportedAt);

        expect(await names(node.id)).toEqual(['po']);
    });

    it.skipIf(!lockable)('should apply both merges when a snapshot and a report race', async () => {
        const node = await createNode();
        const reportedAt = new Date().toISOString();

        // one warm connection per writer, so neither trails behind a handshake
        await Promise.all([dataSource.query('SELECT 1'), dataSource.query('SELECT 1')]);

        await Promise.all([
            repository.replaceForNode(node.id, [
                {
                    name: 'a',
                    report: {
                        name: 'a', 
                        status: 'ok', 
                        version: '1', 
                    }, 
                },
            ], reportedAt),
            repository.upsertForNode(node.id, {
                name: 'a',
                report: { status: 'ok', uptime: 5 },
            }, reportedAt),
        ]);

        const rows = await repository.findManyBy({ nodeId: node.id });

        expect(rows).toHaveLength(1);
        expect(rows[0].version).toEqual('1');
        expect(rows[0].uptime).toEqual(5);
    });

    // Two nodes without rows sit in the same gap of UNIQUE(node_id, name): a
    // locking component read would take compatible gap locks on both sides
    // and deadlock the two first inserts on MySQL.
    it.skipIf(!lockable)('should let two nodes write their first snapshot at once', async () => {
        const writes = ['a', 'b', 'c'].map((name) => ({ name, report: { name, status: 'ok' as const } }));

        for (let i = 0; i < 5; i++) {
            // ids above every stored one, so both land in the same (last) gap
            const base = Date.now() * 10;
            const [x, y] = await Promise.all([
                createNode({ id: highUUID(base) }),
                createNode({ id: highUUID(base + 1) }),
            ]);
            const reportedAt = new Date().toISOString();

            await Promise.all([dataSource.query('SELECT 1'), dataSource.query('SELECT 1')]);

            const results = await Promise.allSettled([
                repository.replaceForNode(x.id, writes, reportedAt),
                repository.replaceForNode(y.id, writes, reportedAt),
            ]);

            expect(results.filter((result) => result.status === 'rejected')).toEqual([]);
            expect(await names(x.id)).toEqual(['a', 'b', 'c']);
            expect(await names(y.id)).toEqual(['a', 'b', 'c']);
        }
    });

    it('should reject a write for a node that does not exist', async () => {
        const reportedAt = new Date().toISOString();

        await expect(repository.upsertForNode(faker.string.uuid(), {
            name: 'a',
            report: { status: 'ok' },
        }, reportedAt)).rejects.toThrow(EntityNotFoundError);
        await expect(repository.replaceForNode(faker.string.uuid(), [
            { name: 'a', report: { name: 'a', status: 'ok' } },
        ], reportedAt)).rejects.toThrow(EntityNotFoundError);
    });

    it('should find online nodes whose newest report is older than the threshold', async () => {
        const stale = await createNode({ online: true });
        const fresh = await createNode({ online: true });
        const empty = await createNode({ online: true });
        const offline = await createNode({ online: false });

        await repository.replaceForNode(stale.id, [
            { name: 'a', report: { name: 'a', status: 'ok' } },
        ], minutesAgo(6));
        await repository.replaceForNode(fresh.id, [
            { name: 'a', report: { name: 'a', status: 'ok' } },
        ], minutesAgo(1));
        await repository.replaceForNode(offline.id, [
            { name: 'a', report: { name: 'a', status: 'ok' } },
        ], minutesAgo(6));

        const ids = await repository.findStaleOnlineNodeIds(minutesAgo(5));

        expect(ids).toContain(stale.id);
        expect(ids).not.toContain(fresh.id);
        expect(ids).toContain(empty.id);
        expect(ids).not.toContain(offline.id);
    });

    it('should judge a node by its newest component, not its oldest', async () => {
        const node = await createNode({ online: true });

        await repository.replaceForNode(node.id, [
            { name: 'a', report: { name: 'a', status: 'ok' } },
        ], minutesAgo(10));
        await repository.upsertForNode(node.id, {
            name: 'b',
            report: { status: 'ok' },
        }, minutesAgo(1));

        expect(await repository.findStaleOnlineNodeIds(minutesAgo(5))).not.toContain(node.id);
    });

    function setVersion(version: string) {
        return (node: Node): boolean => {
            node.online = true;
            node.deploymentVersion = version;

            return true;
        };
    }

    it('should apply touch to the current node row in the write transaction', async () => {
        const node = await createNode({ online: false });

        // another writer renames the node after the service loaded it
        const current = await nodeRepository.findOneById(node.id);

        current.name = 'renamed';
        await nodeRepository.save(current);

        await repository.replaceForNode(node.id, [
            { name: 'a', report: { name: 'a', status: 'ok' } },
        ], new Date().toISOString(), { touch: setVersion('1.2.3') });

        const stored = await nodeRepository.findOneById(node.id);

        expect(stored?.name).toBe('renamed');
        expect(stored?.online).toBe(true);
        expect(stored?.deploymentVersion).toBe('1.2.3');

        await repository.upsertForNode(node.id, { name: 'b', report: { status: 'ok' } }, new Date().toISOString(), {
            touch: (locked) => {
                locked.name = 'discarded';

                return false;
            },
        });

        expect((await nodeRepository.findOneById(node.id))?.name).toBe('renamed');
    });

    it('should not call touch for a node that does not exist', async () => {
        let called = false;

        await expect(repository.replaceForNode(faker.string.uuid(), [], new Date().toISOString(), {
            touch: () => {
                called = true;

                return true;
            },
        })).rejects.toThrow(EntityNotFoundError);
        expect(called).toBe(false);
    });

    it.skipIf(!lockable)('should pair the deployment version and the component set of one snapshot', async () => {
        for (let i = 0; i < 10; i++) {
            const node = await createNode({ online: false });
            const reportedAt = new Date().toISOString();

            await Promise.all([dataSource.query('SELECT 1'), dataSource.query('SELECT 1')]);

            await Promise.all([
                repository.replaceForNode(node.id, [
                    { name: 'one', report: { name: 'one', status: 'ok' } },
                ], reportedAt, { touch: setVersion('1') }),
                repository.replaceForNode(node.id, [
                    { name: 'two-a', report: { name: 'two-a', status: 'ok' } },
                    { name: 'two-b', report: { name: 'two-b', status: 'ok' } },
                ], reportedAt, { touch: setVersion('2') }),
            ]);

            const stored = await nodeRepository.findOneById(node.id);
            const expected = stored?.deploymentVersion === '1' ? ['one'] : ['two-a', 'two-b'];

            expect(stored?.online).toBe(true);
            expect(await names(node.id)).toEqual(expected);
        }
    });

    it('should mark a node offline only while it is online and stale', async () => {
        const stale = await createNode({ online: true });
        const fresh = await createNode({ online: true });
        const empty = await createNode({ online: true });
        const offline = await createNode({ online: false });

        await repository.replaceForNode(stale.id, [
            { name: 'a', report: { name: 'a', status: 'ok' } },
        ], minutesAgo(6));
        await repository.replaceForNode(fresh.id, [
            { name: 'a', report: { name: 'a', status: 'ok' } },
        ], minutesAgo(1));

        const before = minutesAgo(5);

        expect(await repository.markOfflineIfStale(stale.id, before)).toBe(true);
        expect(await repository.markOfflineIfStale(fresh.id, before)).toBe(false);
        expect(await repository.markOfflineIfStale(empty.id, before)).toBe(true);
        expect(await repository.markOfflineIfStale(offline.id, before)).toBe(false);
        expect(await repository.markOfflineIfStale(faker.string.uuid(), before)).toBe(false);

        expect((await nodeRepository.findOneById(stale.id))?.online).toBe(false);
        expect((await nodeRepository.findOneById(fresh.id))?.online).toBe(true);
        expect((await nodeRepository.findOneById(empty.id))?.online).toBe(false);
    });

    it('should keep a node online that reported after it was selected as stale', async () => {
        const node = await createNode({ online: true });

        await repository.replaceForNode(node.id, [
            { name: 'a', report: { name: 'a', status: 'ok' } },
        ], minutesAgo(6));

        const before = minutesAgo(5);

        expect(await repository.findStaleOnlineNodeIds(before)).toContain(node.id);

        await repository.upsertForNode(node.id, { name: 'a', report: { status: 'ok' } }, new Date().toISOString());

        expect(await repository.markOfflineIfStale(node.id, before)).toBe(false);
        expect((await nodeRepository.findOneById(node.id))?.online).toBe(true);
    });

    it.skipIf(!lockable)('should never leave a freshly reported node offline when the sweep races the report', async () => {
        for (let i = 0; i < 10; i++) {
            const node = await createNode({ online: true });

            await repository.replaceForNode(node.id, [
                { name: 'a', report: { name: 'a', status: 'ok' } },
            ], minutesAgo(6));

            const before = minutesAgo(5);

            expect(await repository.findStaleOnlineNodeIds(before)).toContain(node.id);

            await Promise.all([dataSource.query('SELECT 1'), dataSource.query('SELECT 1')]);

            await Promise.all([
                repository.markOfflineIfStale(node.id, before),
                repository.upsertForNode(node.id, { name: 'a', report: { status: 'ok' } }, new Date().toISOString(), {
                    touch: (locked) => {
                        if (locked.online) {
                            return false;
                        }

                        locked.online = true;

                        return true;
                    },
                }),
            ]);

            expect((await nodeRepository.findOneById(node.id))?.online).toBe(true);
        }
    });
});
