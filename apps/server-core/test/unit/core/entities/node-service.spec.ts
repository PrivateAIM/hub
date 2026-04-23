/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Node } from '@privateaim/core-kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { NodeService } from '../../../../src/core/entities/node/service.ts';
import {
    FakeNodeRepository,
    FakeRegistryManager,
    createAllowAllActor,
    createDenyAllActor,
    createMasterRealmActor,
    createNonMasterRealmActor,
} from '../helpers/index.ts';

function createTestNode(overrides?: Partial<Node>): Node {
    return {
        id: randomUUID(),
        name: 'test-node',
        hidden: false,
        type: 'default',
        external_name: null,
        public_key: null,
        online: false,
        registry_id: null,
        registry_project_id: null,
        robot_id: null,
        client_id: null,
        realm_id: 'realm-1',
        created_at: new Date(),
        updated_at: new Date(),
        ...overrides,
    } as Node;
}

describe('NodeService', () => {
    let repository: FakeNodeRepository;
    let registryManager: FakeRegistryManager;
    let service: NodeService;

    beforeEach(() => {
        repository = new FakeNodeRepository();
        registryManager = new FakeRegistryManager();
        service = new NodeService({ repository, registryManager });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            repository.seed([
                createTestNode({ id: 'n-1' }),
                createTestNode({ id: 'n-2' }),
            ]);

            const result = await service.getMany({});
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            const node = createTestNode({ id: 'n-1' });
            repository.seed(node);

            const result = await service.getOne('n-1');
            expect(result.id).toBe('n-1');
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent')).rejects.toThrow(NotFoundError);
        });
    });

    describe('create', () => {
        it('should create with valid data', async () => {
            const result = await service.create(
                { name: 'new-node' },
                createMasterRealmActor('realm-1'),
            );

            expect(result.name).toBe('new-node');
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            await expect(
                service.create({ name: 'new-node' }, createDenyAllActor()),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should set realm_id from actor when not provided', async () => {
            const actor = createMasterRealmActor('actor-realm-id');

            const result = await service.create(
                { name: 'new-node' },
                actor,
            );

            expect(result.realm_id).toBe('actor-realm-id');
        });

        it('should throw ForbiddenError when non-master realm sets different realm_id', async () => {
            const actor = createNonMasterRealmActor('realm-1');
            const otherRealmId = randomUUID();

            await expect(
                service.create(
                    { name: 'new-node', realm_id: otherRealmId },
                    actor,
                ),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should link registry project when registryManager is available', async () => {
            registryManager.setDefaultRegistryId('registry-1');

            await service.create(
                { name: 'new-node' },
                createMasterRealmActor(),
            );

            expect(registryManager.getLinkCalls()).toHaveLength(1);
            expect(registryManager.getProjects()).toHaveLength(1);
        });

        it('should convert non-hex public_key to hex', async () => {
            const result = await service.create(
                { name: 'new-node', public_key: 'hello' },
                createMasterRealmActor(),
            );

            expect(result.public_key).toBe(Buffer.from('hello', 'utf8').toString('hex'));
        });
    });

    describe('update', () => {
        it('should update existing entity', async () => {
            const node = createTestNode({ realm_id: 'realm-1' });
            repository.seed(node);

            const result = await service.update(
                node.id,
                { name: 'updated-node' },
                createMasterRealmActor(),
            );

            expect(result.name).toBe('updated-node');
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.update('nonexistent', { name: 'updated-node' }, createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            const node = createTestNode();
            repository.seed(node);

            await expect(
                service.update(node.id, { name: 'updated-node' }, createDenyAllActor()),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should enforce realm writability for non-master realm', async () => {
            const node = createTestNode({ realm_id: 'other-realm' });
            repository.seed(node);

            await expect(
                service.update(node.id, { name: 'updated-node' }, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(ForbiddenError);
        });
    });

    describe('delete', () => {
        it('should delete existing entity', async () => {
            const node = createTestNode();
            repository.seed(node);

            const result = await service.delete(node.id, createMasterRealmActor());
            expect(result.id).toBe(node.id);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            const node = createTestNode();
            repository.seed(node);

            await expect(
                service.delete(node.id, createDenyAllActor()),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should enforce realm writability for non-master realm', async () => {
            const node = createTestNode({ realm_id: 'other-realm' });
            repository.seed(node);

            await expect(
                service.delete(node.id, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should unlink registry project on delete', async () => {
            const registryProjectId = randomUUID();
            registryManager.seedProject({
                id: registryProjectId,
                external_name: 'test',
            } as any);

            const node = createTestNode({ registry_project_id: registryProjectId });
            repository.seed(node);

            await service.delete(node.id, createMasterRealmActor());

            expect(registryManager.getUnlinkCalls()).toHaveLength(1);
            expect(registryManager.getProjects()).toHaveLength(0);
        });
    });
});
