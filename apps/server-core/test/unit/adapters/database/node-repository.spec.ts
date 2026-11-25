/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import type { Node } from '@privateaim/core-kit';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { DatabaseInjectionKey } from '../../../../src/app/modules/database/index.ts';
import type { INodeRepository } from '../../../../src/core/index.ts';
import { createTestDatabaseApplication } from '../../../app/index.ts';

/**
 * `updateLocked` on the node adapter: it writes the row as it is now, never
 * an earlier copy, and never inserts a missing row.
 */
describe('node repository updateLocked', () => {
    const suite = createTestDatabaseApplication();
    let repository: INodeRepository;

    beforeAll(async () => {
        await suite.setup();
        repository = suite.container.resolve(DatabaseInjectionKey.NodeRepository);
    });

    afterAll(async () => {
        await suite.teardown();
    });

    async function createNode(data: Partial<Node> = {}): Promise<Node> {
        return repository.save(repository.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            realmId: faker.string.uuid(),
            online: false,
            ...data,
        }));
    }

    it('should apply fn to the current row and keep a concurrent edit', async () => {
        const node = await createNode();
        const stale = await repository.findOneById(node.id);

        // another writer renames the node after `stale` was read
        const current = await repository.findOneById(node.id);

        current.name = 'renamed';
        await repository.save(current);

        const saved = await repository.updateLocked(stale.id, (entity) => {
            entity.online = true;
            entity.deploymentVersion = '1.2.3';

            return true;
        });

        expect(saved?.online).toBe(true);

        const stored = await repository.findOneById(node.id);

        expect(stored?.name).toBe('renamed');
        expect(stored?.online).toBe(true);
        expect(stored?.deploymentVersion).toBe('1.2.3');
    });

    it('should not save when fn declines', async () => {
        const node = await createNode({ name: 'kept' });

        const saved = await repository.updateLocked(node.id, (entity) => {
            entity.name = 'discarded';

            return false;
        });

        expect(saved).toBeNull();
        expect((await repository.findOneById(node.id))?.name).toBe('kept');
    });

    it('should resolve null and insert nothing for a missing row', async () => {
        const node = await createNode();
        // remove() clears the entity's id
        const { id } = node;

        await repository.remove(node);

        let called = false;
        const saved = await repository.updateLocked(id, (entity) => {
            called = true;
            entity.online = true;

            return true;
        });

        expect(saved).toBeNull();
        expect(called).toBe(false);
        expect(await repository.findOneById(id)).toBeNull();
    });
});
