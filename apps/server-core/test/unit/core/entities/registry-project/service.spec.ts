/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Node, Registry, RegistryProject } from '@privateaim/core-kit';
import { RegistryProjectType } from '@privateaim/core-kit';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { RegistryProjectService } from '../../../../../src/core/entities/registry-project/service.ts';
import type { FakePermissionChecker } from '../../helpers/index.ts';
import {
    FakeEntityRepository,
    createAllowAllActor,
    createDenyAllActor,
    createMasterRealmActor,
    createNonMasterRealmActor,
} from '../../helpers/index.ts';
import { FakeRegistryManager } from '../node/fake-registry-manager.ts';
import { FakeRegistryProjectRepository } from './fake-repository.ts';

function createFakeRegistryProjectRepository() {
    const repo = new FakeRegistryProjectRepository();

    const originalValidateJoinColumns = repo.validateJoinColumns.bind(repo);
    repo.validateJoinColumns = async (data: Partial<RegistryProject>) => {
        await originalValidateJoinColumns(data);

        if (!data.registry) {
            data.registry = {
                id: data.registryId,
                name: 'test-registry',
            } as Registry;
        }
    };

    return repo;
}

function createTestRegistryProject(overrides?: Partial<RegistryProject>): RegistryProject {
    return {
        id: randomUUID(),
        name: 'test-project',
        type: RegistryProjectType.DEFAULT,
        public: false,
        externalName: 'ext-name',
        externalId: null,
        accountId: null,
        accountName: null,
        accountSecret: null,
        webhookName: null,
        webhookExists: null,
        registryId: randomUUID(),
        realmId: 'realm-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    } as RegistryProject;
}

describe('RegistryProjectService', () => {
    let repository: FakeEntityRepository<RegistryProject>;
    let registryManager: FakeRegistryManager;
    let nodeRepository: FakeEntityRepository<Node>;
    let service: RegistryProjectService;

    beforeEach(() => {
        repository = createFakeRegistryProjectRepository();
        registryManager = new FakeRegistryManager();
        nodeRepository = new FakeEntityRepository<Node>();
        service = new RegistryProjectService({
            repository,
            registryManager,
            nodeRepository,
        });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            repository.seed([
                createTestRegistryProject({ id: 'rp-1' }),
                createTestRegistryProject({ id: 'rp-2' }),
            ]);

            const result = await service.getMany({}, createAllowAllActor());
            expect(result.data).toHaveLength(2);
        });

        it('should check secret field access when entities have accountSecret', async () => {
            repository.seed([
                createTestRegistryProject({ id: 'rp-1', accountSecret: 'secret123' }),
            ]);

            const actor = createAllowAllActor();
            await service.getMany({}, actor);

            expect((actor.permissionChecker as FakePermissionChecker).wasMethodCalled('preCheck')).toBe(true);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            const project = createTestRegistryProject({ id: 'rp-1' });
            repository.seed(project);

            const result = await service.getOne('rp-1', createAllowAllActor());
            expect(result.id).toBe('rp-1');
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.getOne('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should check secret access when entity has accountSecret', async () => {
            const project = createTestRegistryProject({ id: 'rp-1', accountSecret: 'secret' });
            repository.seed(project);

            const actor = createAllowAllActor();
            await service.getOne('rp-1', actor);

            expect((actor.permissionChecker as FakePermissionChecker).wasMethodCalled('preCheck')).toBe(true);
        });

        it('should allow node-client to access own registry project secret', async () => {
            const registryProjectId = 'rp-1';
            const clientId = randomUUID();

            const project = createTestRegistryProject({
                id: registryProjectId,
                accountSecret: 'secret',
            });
            repository.seed(project);

            nodeRepository.seed({
                id: randomUUID(),
                clientId,
                registryProjectId,
            } as Node);

            const actor = createDenyAllActor();
            actor.identity = { id: clientId, type: 'client' };

            const result = await service.getOne(registryProjectId, actor);
            expect(result.id).toBe(registryProjectId);
        });
    });

    describe('create', () => {
        it('should create with valid data', async () => {
            const registryId = randomUUID();

            const result = await service.create(
                {
                    name: 'new-project',
                    type: RegistryProjectType.DEFAULT,
                    externalName: 'ext',
                    registryId,
                },
                createAllowAllActor(),
            );

            expect(result.name).toBe('new-project');
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should link project via registryManager after save', async () => {
            await service.create(
                {
                    name: 'new-project',
                    type: RegistryProjectType.DEFAULT,
                    externalName: 'ext',
                    registryId: randomUUID(),
                },
                createAllowAllActor(),
            );

            expect(registryManager.getLinkCalls()).toHaveLength(1);
        });

        it('should throw PermissionDeniedError when actor lacks permission', async () => {
            await expect(
                service.create(
                    {
                        name: 'new-project',
                        type: RegistryProjectType.DEFAULT,
                        externalName: 'ext',
                        registryId: randomUUID(),
                    },
                    createDenyAllActor(),
                ),
            ).rejects.toThrow(PermissionDeniedError);
        });
    });

    describe('update', () => {
        it('should update existing entity', async () => {
            const project = createTestRegistryProject();
            repository.seed(project);

            const result = await service.update(
                project.id,
                { name: 'updated-project' },
                createMasterRealmActor(),
            );

            expect(result.name).toBe('updated-project');
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.update('nonexistent', { name: 'updated-project' }, createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should throw PermissionDeniedError when actor lacks permission', async () => {
            const project = createTestRegistryProject();
            repository.seed(project);

            await expect(
                service.update(project.id, { name: 'updated-project' }, createDenyAllActor()),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should enforce realm writability for non-master realm', async () => {
            const project = createTestRegistryProject({ realmId: 'other-realm' });
            repository.seed(project);

            await expect(
                service.update(project.id, { name: 'updated-project' }, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should unlink and relink when externalName changes', async () => {
            const project = createTestRegistryProject({ externalName: 'old-name' });
            repository.seed(project);

            await service.update(
                project.id,
                { externalName: 'new-name' },
                createMasterRealmActor(),
            );

            expect(registryManager.getUnlinkCalls()).toHaveLength(1);
            expect(registryManager.getLinkCalls()).toHaveLength(1);
        });

        it('should only link (not unlink) when externalName does not change', async () => {
            const project = createTestRegistryProject({ externalName: 'same-name' });
            repository.seed(project);

            await service.update(
                project.id,
                { name: 'updated' },
                createMasterRealmActor(),
            );

            expect(registryManager.getUnlinkCalls()).toHaveLength(0);
            expect(registryManager.getLinkCalls()).toHaveLength(1);
        });
    });

    describe('delete', () => {
        it('should delete existing entity', async () => {
            const project = createTestRegistryProject();
            repository.seed(project);

            const result = await service.delete(project.id, createMasterRealmActor());
            expect(result.id).toBe(project.id);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should throw PermissionDeniedError when actor lacks permission', async () => {
            const project = createTestRegistryProject();
            repository.seed(project);

            await expect(
                service.delete(project.id, createDenyAllActor()),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should enforce realm writability for non-master realm', async () => {
            const project = createTestRegistryProject({ realmId: 'other-realm' });
            repository.seed(project);

            await expect(
                service.delete(project.id, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should unlink project via registryManager on delete', async () => {
            const project = createTestRegistryProject();
            repository.seed(project);

            await service.delete(project.id, createMasterRealmActor());

            expect(registryManager.getUnlinkCalls()).toHaveLength(1);
        });
    });
});
