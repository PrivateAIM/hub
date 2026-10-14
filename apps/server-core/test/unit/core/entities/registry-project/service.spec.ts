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
import { PermissionName } from '@privateaim/kit';
import { eq } from '@rapiq/core';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { RegistryProjectService } from '../../../../../src/core/entities/registry-project/service.ts';
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

            const result = await service.getMany({}, createAllowAllActor('realm-1'));
            expect(result.data).toHaveLength(2);
        });

        it('should check secret field access when entities have accountSecret', async () => {
            repository.seed([
                createTestRegistryProject({ id: 'rp-1', accountSecret: 'secret123' }),
            ]);

            const actor = createAllowAllActor('realm-1');
            await service.getMany({}, actor);

            expect(actor.permissionEvaluator.preEvaluateCalls.length).toBeGreaterThan(0);
        });

        it('should require a read grant', async () => {
            const actor = createDenyAllActor();

            await expect(service.getMany({}, actor)).rejects.toThrow(PermissionDeniedError);
            const names = [PermissionName.REGISTRY_PROJECT_READ, PermissionName.REGISTRY_PROJECT_MANAGE, PermissionName.REGISTRY_MANAGE];
            expect(actor.permissionEvaluator.preEvaluateOneOfCalls[0]).toMatchObject({ name: names });
        });

        describe('reach', () => {
            beforeEach(() => {
                repository.seed([
                    createTestRegistryProject({ id: 'rp-1', realmId: 'realm-1' }),
                    createTestRegistryProject({ id: 'rp-2', realmId: 'realm-2' }),
                ]);
            });

            it('should return every row on an allow verdict', async () => {
                const actor = createAllowAllActor('realm-1');
                actor.permissionEvaluator.setCompileResult({ verdict: 'allow' });

                const result = await service.getMany({}, actor);
                expect(result.data.map((e) => e.id).sort()).toEqual(['rp-1', 'rp-2']);
            });

            it('should narrow to the compiled condition', async () => {
                const actor = createAllowAllActor('realm-1');
                actor.permissionEvaluator.setCompileResult({ verdict: 'conditional', condition: eq('realmId', 'realm-2') });

                const result = await service.getMany({}, actor);
                expect(result.data.map((e) => e.id)).toEqual(['rp-2']);
            });

            it('should narrow a post verdict to the actor realm', async () => {
                const result = await service.getMany({}, createAllowAllActor('realm-1'));
                expect(result.data.map((e) => e.id)).toEqual(['rp-1']);
            });

            it('should return nothing on a deny verdict', async () => {
                const actor = createAllowAllActor('realm-1');
                actor.permissionEvaluator.setCompileResult({ verdict: 'deny' });

                const result = await service.getMany({}, actor);
                expect(result.data).toHaveLength(0);
            });
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            const project = createTestRegistryProject({ id: 'rp-1' });
            repository.seed(project);

            const result = await service.getOne('rp-1', createAllowAllActor('realm-1'));
            expect(result.id).toBe('rp-1');
        });

        it('should require a read grant', async () => {
            repository.seed(createTestRegistryProject({ id: 'rp-1' }));

            await expect(
                service.getOne('rp-1', createDenyAllActor('realm-1')),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should answer an out-of-reach row like a missing one', async () => {
            repository.seed(createTestRegistryProject({ id: 'rp-1', realmId: 'other-realm' }));

            await expect(
                service.getOne('rp-1', createAllowAllActor('realm-1')),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.getOne('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should check secret access when entity has accountSecret', async () => {
            const project = createTestRegistryProject({ id: 'rp-1', accountSecret: 'secret' });
            repository.seed(project);

            const actor = createAllowAllActor('realm-1');
            await service.getOne('rp-1', actor);

            expect(actor.permissionEvaluator.preEvaluateCalls.length).toBeGreaterThan(0);
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

        it('should not let a node-client read another registry project', async () => {
            const clientId = randomUUID();

            repository.seed([
                createTestRegistryProject({ id: 'rp-1' }),
                createTestRegistryProject({ id: 'rp-2' }),
            ]);
            nodeRepository.seed({
                id: randomUUID(),
                clientId,
                registryProjectId: 'rp-1',
            } as Node);

            const actor = createDenyAllActor();
            actor.identity = { id: clientId, type: 'client' };

            // Out of the node client's reach answers like a missing row.
            await expect(service.getOne('rp-2', actor)).rejects.toThrow(EntityNotFoundError);
        });

        it('should narrow a node-client listing to its own project, secret included', async () => {
            const clientId = randomUUID();

            repository.seed([
                createTestRegistryProject({ id: 'rp-1', accountSecret: 'secret' }),
                createTestRegistryProject({ id: 'rp-2', accountSecret: 'other' }),
            ]);
            nodeRepository.seed({
                id: randomUUID(),
                clientId,
                registryProjectId: 'rp-1',
            } as Node);

            const actor = createDenyAllActor();
            actor.identity = { id: clientId, type: 'client' };

            const result = await service.getMany({}, actor);
            expect(result.data.map((e) => e.id)).toEqual(['rp-1']);
        });

        it('should not mistake a failing permission check for a denial', async () => {
            // Only a denial may fall through to the node-client fallback; an
            // infrastructure failure must surface instead of being read as
            // "not permitted" and answered by the fallback.
            const registryProjectId = 'rp-1';
            const clientId = randomUUID();

            repository.seed(createTestRegistryProject({ id: registryProjectId, accountSecret: 'secret' }));
            nodeRepository.seed({
                id: randomUUID(),
                clientId,
                registryProjectId,
            } as Node);

            const failure = new Error('catalog unreachable');
            const actor = createDenyAllActor();
            actor.identity = { id: clientId, type: 'client' };
            actor.permissionEvaluator.denyAll(failure);

            await expect(service.getOne(registryProjectId, actor)).rejects.toBe(failure);
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
