/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Node, RegistryProject } from '@privateaim/core-kit';
import { RegistryProjectType } from '@privateaim/core-kit';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { NodeService } from '../../../../../src/core/entities/node/service.ts';
import {
    createAllowAllActor,
    createDenyAllActor,
    createMasterRealmActor,
    createNonMasterRealmActor,
} from '../../helpers/index.ts';
import { FakeNodeRepository } from './fake-repository.ts';
import { FakeRegistryManager } from './fake-registry-manager.ts';

function createTestNode(overrides?: Partial<Node>): Node {
    return {
        id: randomUUID(),
        name: 'test-node',
        hidden: false,
        type: 'default',
        externalName: null,
        publicKey: null,
        online: false,
        registryId: null,
        registryProjectId: null,
        robotId: null,
        clientId: null,
        realmId: 'realm-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    } as Node;
}

function createTestRegistryProject(overrides?: Partial<RegistryProject>): RegistryProject {
    return {
        id: randomUUID(),
        name: 'test-project',
        type: RegistryProjectType.NODE,
        public: false,
        externalName: 'extname',
        externalId: null,
        accountId: null,
        accountName: null,
        accountSecret: null,
        webhookName: null,
        webhookExists: null,
        registryId: randomUUID(),
        realmId: 'realm-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
    } as RegistryProject;
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

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent')).rejects.toThrow(EntityNotFoundError);
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

        it('should throw PermissionDeniedError when actor lacks permission', async () => {
            await expect(
                service.create({ name: 'new-node' }, createDenyAllActor()),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should set realmId from actor when not provided', async () => {
            const actor = createMasterRealmActor('actor-realm-id');

            const result = await service.create(
                { name: 'new-node' },
                actor,
            );

            expect(result.realmId).toBe('actor-realm-id');
        });

        it('should throw PermissionDeniedError when non-master realm sets different realmId', async () => {
            const actor = createNonMasterRealmActor('realm-1');
            const otherRealmId = randomUUID();

            await expect(
                service.create(
                    { name: 'new-node', realmId: otherRealmId },
                    actor,
                ),
            ).rejects.toThrow(PermissionDeniedError);
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

        it('should record the registry assignment when it falls back to the default registry', async () => {
            registryManager.setDefaultRegistryId('registry-1');

            const result = await service.create(
                { name: 'new-node' },
                createMasterRealmActor(),
            );

            // A node owning a project but with a null `registryId` reads as
            // "not connected" everywhere the column is the source of truth.
            expect(result.registryId).toBe('registry-1');
            expect(result.registryProjectId).toBe(registryManager.getProjects()[0].id);
        });

        it('should convert non-hex publicKey to hex', async () => {
            const result = await service.create(
                { name: 'new-node', publicKey: 'hello' },
                createMasterRealmActor(),
            );

            expect(result.publicKey).toBe(Buffer.from('hello', 'utf8').toString('hex'));
        });
    });

    describe('update', () => {
        it('should update existing entity', async () => {
            const node = createTestNode({ realmId: 'realm-1' });
            repository.seed(node);

            const result = await service.update(
                node.id,
                { name: 'updated-node' },
                createMasterRealmActor(),
            );

            expect(result.name).toBe('updated-node');
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.update('nonexistent', { name: 'updated-node' }, createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should throw PermissionDeniedError when actor lacks permission', async () => {
            const node = createTestNode();
            repository.seed(node);

            await expect(
                service.update(node.id, { name: 'updated-node' }, createDenyAllActor()),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should enforce realm writability for non-master realm', async () => {
            const node = createTestNode({ realmId: 'other-realm' });
            repository.seed(node);

            await expect(
                service.update(node.id, { name: 'updated-node' }, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should re-provision the registry project when re-assigned to a different registry', async () => {
            const registryId = randomUUID();
            const nextRegistryId = randomUUID();

            const registryProject = createTestRegistryProject({
                registryId,
                externalName: 'extname',
            });
            registryManager.seedProject(registryProject);

            const node = createTestNode({
                realmId: 'realm-1',
                registryId,
                registryProjectId: registryProject.id,
                externalName: 'extname',
            });
            repository.seed(node);

            const result = await service.update(
                node.id,
                { registryId: nextRegistryId },
                createMasterRealmActor(),
            );

            // The stale project (on the old registry) is torn down ...
            expect(registryManager.getUnlinkCalls()).toHaveLength(1);
            expect(registryManager.getUnlinkCalls()[0].id).toBe(registryProject.id);

            // ... and a fresh project is provisioned on the new registry.
            const projects = registryManager.getProjects();
            expect(projects).toHaveLength(1);
            expect(projects[0].id).not.toBe(registryProject.id);
            expect(projects[0].registryId).toBe(nextRegistryId);

            // The node now points at the new project (so credentials resolve the
            // new registry's host, not the old one).
            expect(result.registryProjectId).toBe(projects[0].id);
            expect(registryManager.getLinkCalls()).toContain(projects[0].id);
        });

        it('should keep the existing registry project when the registry is unchanged', async () => {
            const registryId = randomUUID();

            const registryProject = createTestRegistryProject({
                registryId,
                externalName: 'extname',
            });
            registryManager.seedProject(registryProject);

            const node = createTestNode({
                realmId: 'realm-1',
                registryId,
                registryProjectId: registryProject.id,
                externalName: 'extname',
            });
            repository.seed(node);

            const result = await service.update(
                node.id,
                { name: 'renamed-node' },
                createMasterRealmActor(),
            );

            expect(registryManager.getUnlinkCalls()).toHaveLength(0);
            expect(registryManager.getProjects()).toHaveLength(1);
            expect(result.registryProjectId).toBe(registryProject.id);
        });

        it('should tear down the registry project when the registry is cleared', async () => {
            const registryId = randomUUID();

            const registryProject = createTestRegistryProject({
                registryId,
                externalName: 'extname',
            });
            registryManager.seedProject(registryProject);

            const node = createTestNode({
                realmId: 'realm-1',
                registryId,
                registryProjectId: registryProject.id,
                externalName: 'extname',
            });
            repository.seed(node);

            const result = await service.update(
                node.id,
                { registryId: null },
                createMasterRealmActor(),
            );

            expect(registryManager.getUnlinkCalls()).toHaveLength(1);
            expect(registryManager.getUnlinkCalls()[0].id).toBe(registryProject.id);
            expect(registryManager.getProjects()).toHaveLength(0);

            // No dangling reference: the node must not keep resolving credentials
            // from a registry it is no longer assigned to.
            expect(result.registryId).toBeNull();
            expect(result.registryProjectId).toBeNull();
        });

        it('should keep the registry project when an unrelated field is updated on a node with no registryId', async () => {
            // Nodes provisioned against the *default* registry before that
            // assignment was recorded still carry `registryId = null` while
            // owning a project. A rename must not be read as a disconnect.
            const registryProject = createTestRegistryProject({ externalName: 'extname' });
            registryManager.seedProject(registryProject);

            const node = createTestNode({
                realmId: 'realm-1',
                registryId: null,
                registryProjectId: registryProject.id,
                externalName: 'extname',
            });
            repository.seed(node);

            const result = await service.update(
                node.id,
                { name: 'renamed-node' },
                createMasterRealmActor(),
            );

            expect(registryManager.getUnlinkCalls()).toHaveLength(0);
            expect(registryManager.getRemoveCalls()).toHaveLength(0);
            expect(registryManager.getProjects()).toHaveLength(1);
            expect(result.registryProjectId).toBe(registryProject.id);
        });

        it('should detach and persist the node before removing its registry project', async () => {
            const registryId = randomUUID();

            const registryProject = createTestRegistryProject({
                registryId,
                externalName: 'extname',
            });
            registryManager.seedProject(registryProject);

            const node = createTestNode({
                realmId: 'realm-1',
                registryId,
                registryProjectId: registryProject.id,
                externalName: 'extname',
            });
            repository.seed(node);

            // `nodes.registryProjectId` is an `ON DELETE CASCADE` FK, so removing
            // the project while the stored node still points at it would delete the
            // node row. Capture what the repository holds at removal time.
            let persistedAtRemoval: Node | null = null;
            registryManager.observeRemoveProject(() => {
                persistedAtRemoval = repository.getAll()
                    .find((item) => item.id === node.id) ?? null;
            });

            await service.update(node.id, { registryId: null }, createMasterRealmActor());

            expect(registryManager.getRemoveCalls()).toHaveLength(1);
            expect(persistedAtRemoval).not.toBeNull();
            expect(persistedAtRemoval!.registryProjectId).toBeNull();
        });

        it('should detach and persist the node before removing the stale project on re-assignment', async () => {
            const registryId = randomUUID();
            const nextRegistryId = randomUUID();

            const registryProject = createTestRegistryProject({
                registryId,
                externalName: 'extname',
            });
            registryManager.seedProject(registryProject);

            const node = createTestNode({
                realmId: 'realm-1',
                registryId,
                registryProjectId: registryProject.id,
                externalName: 'extname',
            });
            repository.seed(node);

            let referencedAtRemoval: string | null | undefined;
            registryManager.observeRemoveProject(() => {
                referencedAtRemoval = repository.getAll()
                    .find((item) => item.id === node.id)?.registryProjectId;
            });

            await service.update(node.id, { registryId: nextRegistryId }, createMasterRealmActor());

            // The node already points at the freshly provisioned project — never at
            // the one being removed.
            expect(registryManager.getRemoveCalls()).toHaveLength(1);
            expect(registryManager.getRemoveCalls()[0].id).toBe(registryProject.id);
            expect(referencedAtRemoval).not.toBe(registryProject.id);
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

        it('should throw PermissionDeniedError when actor lacks permission', async () => {
            const node = createTestNode();
            repository.seed(node);

            await expect(
                service.delete(node.id, createDenyAllActor()),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should enforce realm writability for non-master realm', async () => {
            const node = createTestNode({ realmId: 'other-realm' });
            repository.seed(node);

            await expect(
                service.delete(node.id, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should unlink registry project on delete', async () => {
            const registryProjectId = randomUUID();
            registryManager.seedProject({
                id: registryProjectId,
                externalName: 'test',
            } as any);

            const node = createTestNode({ registryProjectId });
            repository.seed(node);

            await service.delete(node.id, createMasterRealmActor());

            expect(registryManager.getUnlinkCalls()).toHaveLength(1);
            expect(registryManager.getProjects()).toHaveLength(0);
        });
    });
});
