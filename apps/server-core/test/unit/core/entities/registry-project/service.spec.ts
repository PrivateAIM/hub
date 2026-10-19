/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { BuiltInPolicyType, PermissionError } from '@authup/access';
import type { Node, Registry, RegistryProject } from '@privateaim/core-kit';
import { RegistryProjectType } from '@privateaim/core-kit';
import { EntityNotFoundError } from '@privateaim/errors';
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
    createScopedActor,
} from '@privateaim/server-test-kit';
import { FakeRegistryManager } from '../node/fake-registry-manager.ts';
import { FakeRegistryProjectRepository } from './fake-repository.ts';

const READ_PERMISSIONS = [
    PermissionName.REGISTRY_PROJECT_READ,
    PermissionName.REGISTRY_PROJECT_MANAGE,
    PermissionName.REGISTRY_MANAGE,
];

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
    let repository: FakeRegistryProjectRepository;
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

    /** Seeds a node of `realmId` owning the given registry project and returns its client id. */
    function seedNodeClient(registryProjectId: string, realmId = 'realm-1'): string {
        const clientId = randomUUID();
        nodeRepository.seed({
            id: randomUUID(),
            clientId,
            registryProjectId,
            realmId,
        } as Node);

        return clientId;
    }

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

        it('should reject without a read permission', async () => {
            const actor = createDenyAllActor();

            await expect(service.getMany({}, actor)).rejects.toThrow(PermissionError);
            expect(actor.permissionEvaluator.preEvaluateOneOfCalls[0]).toMatchObject({ name: READ_PERMISSIONS });
        });

        it('should narrow a node-client listing to its own project, secret included', async () => {
            repository.seed([
                createTestRegistryProject({ id: 'rp-1', accountSecret: 'secret' }),
                createTestRegistryProject({ id: 'rp-2', accountSecret: 'other' }),
            ]);

            const actor = createDenyAllActor();
            actor.identity = {
                id: seedNodeClient('rp-1'),
                type: 'client',
                realmId: 'realm-1',
            };

            const result = await service.getMany({}, actor);
            expect(result.data.map((e) => e.id)).toEqual(['rp-1']);
        });

        // `node.clientId` is writable by node managers: a node of another realm
        // pointing at a client must not hand that client its project.
        it('should not bind a client to a node of another realm', async () => {
            repository.seed(createTestRegistryProject({ id: 'rp-1', accountSecret: 'secret' }));

            const actor = createDenyAllActor();
            actor.identity = {
                id: seedNodeClient('rp-1', 'realm-2'),
                type: 'client',
                realmId: 'realm-1',
            };

            await expect(service.getMany({}, actor)).rejects.toThrow(PermissionError);
        });

        it('should apply a read grant a node-client holds instead of narrowing it to its own project', async () => {
            repository.seed([
                createTestRegistryProject({ id: 'rp-1' }),
                createTestRegistryProject({ id: 'rp-2' }),
            ]);

            const actor = createAllowAllActor('realm-1');
            actor.identity = { id: seedNodeClient('rp-1'), type: 'client' };
            actor.permissionEvaluator.setCompileResult({ verdict: 'allow' });

            const result = await service.getMany({}, actor);
            expect(result.data.map((e) => e.id).sort()).toEqual(['rp-1', 'rp-2']);
        });

        it('should require the registry read permission for include=registry', async () => {
            // Deny only the registry read: the registry-project read itself passes,
            // so a rejection can only come from the relation gate.
            const actor = createAllowAllActor('realm-1');
            actor.permissionEvaluator.setBehavior(({ method, ctx }) => {
                const names = Array.isArray(ctx.name) ? ctx.name : [ctx.name];
                if (method === 'preEvaluateOneOf' && names.includes(PermissionName.REGISTRY_READ)) {
                    throw PermissionError.deniedAll(names);
                }
            });

            await expect(service.getMany({}, actor)).resolves.toBeDefined();
            await expect(service.getMany({ include: 'registry' }, actor)).rejects.toThrow(PermissionError);
        });

        describe('by compile verdict', () => {
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

        it('should reject without a read permission', async () => {
            repository.seed(createTestRegistryProject({ id: 'rp-1' }));

            await expect(
                service.getOne('rp-1', createDenyAllActor('realm-1')),
            ).rejects.toThrow(PermissionError);
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
                realmId: 'realm-1',
            } as Node);

            const actor = createDenyAllActor();
            actor.identity = {
                id: clientId,
                type: 'client',
                realmId: 'realm-1',
            };

            const result = await service.getOne(registryProjectId, actor);
            expect(result.id).toBe(registryProjectId);
        });

        it('should answer a node-client reading another registry project like a missing row', async () => {
            repository.seed([
                createTestRegistryProject({ id: 'rp-1' }),
                createTestRegistryProject({ id: 'rp-2' }),
            ]);

            const actor = createDenyAllActor();
            actor.identity = {
                id: seedNodeClient('rp-1'),
                type: 'client',
                realmId: 'realm-1',
            };

            await expect(service.getOne('rp-2', actor)).rejects.toThrow(EntityNotFoundError);
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

        it('should deny when actor lacks permission', async () => {
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
            ).rejects.toThrow(PermissionError);
        });

        // A project created here carries no realm: a global row.
        it('should require a grant reaching realm-less rows to create', async () => {
            const data = {
                name: 'new-project',
                type: RegistryProjectType.DEFAULT,
                externalName: 'ext',
                registryId: randomUUID(),
            };

            await expect(
                service.create(data, createScopedActor({ realmScope: 'own' })),
            ).rejects.toThrow(PermissionError);
            expect(repository.getAll()).toHaveLength(0);
            expect(registryManager.getLinkCalls()).toHaveLength(0);

            await service.create(data, createScopedActor({ realmScope: 'ownOrNull' }));
            expect(repository.getAll()).toHaveLength(1);
        });
    });

    describe('update', () => {
        it('should update existing entity', async () => {
            const project = createTestRegistryProject();
            repository.seed(project);

            const result = await service.update(
                project.id,
                { name: 'updated-project' },
                createAllowAllActor(),
            );

            expect(result.name).toBe('updated-project');
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.update('nonexistent', { name: 'updated-project' }, createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should deny when actor lacks permission', async () => {
            const project = createTestRegistryProject();
            repository.seed(project);

            await expect(
                service.update(project.id, { name: 'updated-project' }, createDenyAllActor()),
            ).rejects.toThrow(PermissionError);
        });

        it('should deny updating a project in a realm the grant does not reach', async () => {
            const project = createTestRegistryProject({ realmId: 'other-realm' });
            repository.seed(project);

            await expect(
                service.update(project.id, { name: 'updated-project' }, createScopedActor({ realmId: 'realm-1', realmScope: 'own' })),
            ).rejects.toThrow(PermissionError);
            expect(registryManager.getLinkCalls()).toHaveLength(0);
        });

        it('should reach a realm-less project only with an ownOrNull or any grant', async () => {
            const project = createTestRegistryProject({ realmId: null });
            repository.seed(project);

            await expect(
                service.update(project.id, { name: 'updated-project' }, createScopedActor({ realmScope: 'own' })),
            ).rejects.toThrow(PermissionError);

            const result = await service.update(project.id, { name: 'updated-project' }, createScopedActor({ realmScope: 'ownOrNull' }));
            expect(result.name).toBe('updated-project');
        });

        it('should evaluate both the stored and the merged project', async () => {
            const project = createTestRegistryProject({ realmId: 'realm-1' });
            repository.seed(project);

            const actor = createScopedActor({ realmId: 'realm-1', realmScope: 'own' });
            await service.update(project.id, { name: 'updated-project' }, actor);

            const names = actor.permissionEvaluator.evaluateCalls
                .map((call) => call.data?.get<RegistryProject>(BuiltInPolicyType.ATTRIBUTES)?.name);
            expect(names).toEqual(['test-project', 'updated-project']);
        });

        it('should relink with the previous externalName when it changes', async () => {
            const project = createTestRegistryProject({ externalName: 'old-name' });
            repository.seed(project);

            await service.update(
                project.id,
                { externalName: 'new-name' },
                createAllowAllActor(),
            );

            // one command, so its unlink cannot run after its link on another consumer.
            expect(registryManager.getRelinkCalls()).toHaveLength(1);
            expect(registryManager.getRelinkCalls()[0]).toMatchObject({ id: project.id, externalName: 'old-name' });
            expect(registryManager.getUnlinkCalls()).toHaveLength(0);
            expect(registryManager.getLinkCalls()).toHaveLength(0);
        });

        it('should only link (not unlink) when externalName does not change', async () => {
            const project = createTestRegistryProject({ externalName: 'same-name' });
            repository.seed(project);

            await service.update(
                project.id,
                { name: 'updated' },
                createAllowAllActor(),
            );

            expect(registryManager.getUnlinkCalls()).toHaveLength(0);
            expect(registryManager.getLinkCalls()).toHaveLength(1);
        });
    });

    describe('delete', () => {
        it('should delete existing entity', async () => {
            const project = createTestRegistryProject();
            repository.seed(project);

            const result = await service.delete(project.id, createAllowAllActor());
            expect(result.id).toBe(project.id);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should deny when actor lacks permission', async () => {
            const project = createTestRegistryProject();
            repository.seed(project);

            await expect(
                service.delete(project.id, createDenyAllActor()),
            ).rejects.toThrow(PermissionError);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should deny deleting a project in a realm the grant does not reach', async () => {
            const project = createTestRegistryProject({ realmId: 'other-realm' });
            repository.seed(project);

            await expect(
                service.delete(project.id, createScopedActor({ realmId: 'realm-1', realmScope: 'own' })),
            ).rejects.toThrow(PermissionError);
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should unlink project via registryManager on delete', async () => {
            const project = createTestRegistryProject();
            repository.seed(project);

            await service.delete(project.id, createAllowAllActor());

            expect(registryManager.getUnlinkCalls()).toHaveLength(1);
        });
    });
});
