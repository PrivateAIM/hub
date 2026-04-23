/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Registry, RegistryProject } from '@privateaim/core-kit';
import { RegistryAPICommand } from '@privateaim/core-kit';
import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { RegistryService } from '../../../../src/core/entities/registry/service.ts';
import type { FakePermissionChecker } from '../helpers/index.ts';
import {
    FakeEntityRepository,
    FakeRegistryCaller,
    FakeRegistryRepository,
    createAllowAllActor,
    createDenyAllActor,
} from '../helpers/index.ts';

function createTestRegistry(overrides?: Partial<Registry>): Registry {
    return {
        id: randomUUID(),
        name: 'test-registry',
        host: 'registry.example.com',
        account_name: 'admin',
        account_secret: null,
        created_at: new Date(),
        updated_at: new Date(),
        ...overrides,
    } as Registry;
}

describe('RegistryService', () => {
    let repository: FakeRegistryRepository;
    let registryProjectRepository: FakeEntityRepository<RegistryProject>;
    let registryCaller: FakeRegistryCaller;
    let service: RegistryService;

    beforeEach(() => {
        repository = new FakeRegistryRepository();
        registryProjectRepository = new FakeEntityRepository<RegistryProject>();
        registryCaller = new FakeRegistryCaller();
        service = new RegistryService({
            repository,
            registryProjectRepository,
            registryCaller,
        });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            repository.seed([
                createTestRegistry({ id: 'r-1' }),
                createTestRegistry({ id: 'r-2' }),
            ]);

            const result = await service.getMany({}, createAllowAllActor());
            expect(result.data).toHaveLength(2);
        });

        it('should check permission when secret field is requested', async () => {
            repository.seed(createTestRegistry());

            const actor = createAllowAllActor();
            await service.getMany(
                { fields: '+account_secret' },
                actor,
            );

            expect((actor.permissionChecker as FakePermissionChecker).wasMethodCalled('preCheck')).toBe(true);
        });

        it('should throw ForbiddenError when requesting secret without permission', async () => {
            repository.seed(createTestRegistry());

            await expect(
                service.getMany(
                    { fields: '+account_secret' },
                    createDenyAllActor(),
                ),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should not check permission when secret field is not requested', async () => {
            repository.seed(createTestRegistry());

            const actor = createAllowAllActor();
            await service.getMany({}, actor);

            expect((actor.permissionChecker as FakePermissionChecker).wasMethodCalled('preCheck')).toBe(false);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            const registry = createTestRegistry({ id: 'r-1' });
            repository.seed(registry);

            const result = await service.getOne('r-1', createAllowAllActor());
            expect(result.id).toBe('r-1');
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.getOne('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should check permission when query requests secret field', async () => {
            const registry = createTestRegistry({ id: 'r-1' });
            repository.seed(registry);

            const actor = createAllowAllActor();
            await service.getOne('r-1', actor, { fields: '+account_secret' });

            expect((actor.permissionChecker as FakePermissionChecker).wasMethodCalled('preCheck')).toBe(true);
        });
    });

    describe('create', () => {
        it('should create with valid data', async () => {
            const result = await service.create(
                { name: 'new-registry', host: 'https://registry.io:5000/v2' },
                createAllowAllActor(),
            );

            expect(result.name).toBe('new-registry');
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should extract hostname from host string', async () => {
            const result = await service.create(
                { name: 'new-registry', host: 'https://registry.io:5000/v2' },
                createAllowAllActor(),
            );

            expect(result.host).toBe('registry.io');
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            await expect(
                service.create(
                    { name: 'new-registry', host: 'registry.io' },
                    createDenyAllActor(),
                ),
            ).rejects.toThrow(ForbiddenError);
        });
    });

    describe('update', () => {
        it('should update existing entity', async () => {
            const registry = createTestRegistry();
            repository.seed(registry);

            const result = await service.update(
                registry.id,
                { name: 'updated-registry' },
                createAllowAllActor(),
            );

            expect(result.name).toBe('updated-registry');
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.update('nonexistent', { name: 'updated-registry' }, createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            const registry = createTestRegistry();
            repository.seed(registry);

            await expect(
                service.update(registry.id, { name: 'updated-registry' }, createDenyAllActor()),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should extract hostname on update', async () => {
            const registry = createTestRegistry();
            repository.seed(registry);

            const result = await service.update(
                registry.id,
                { host: 'https://new-host.io/v2' },
                createAllowAllActor(),
            );

            expect(result.host).toBe('new-host.io');
        });
    });

    describe('delete', () => {
        it('should delete existing entity', async () => {
            const registry = createTestRegistry();
            repository.seed(registry);

            const result = await service.delete(registry.id, createAllowAllActor());
            expect(result.id).toBe(registry.id);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            const registry = createTestRegistry();
            repository.seed(registry);

            await expect(
                service.delete(registry.id, createDenyAllActor()),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('executeCommand', () => {
        describe('SETUP/CLEANUP/DELETE', () => {
            it('should call registryCaller for SETUP command', async () => {
                const registry = createTestRegistry({ id: 'r-1' });
                repository.seed(registry);

                await service.executeCommand(
                    RegistryAPICommand.SETUP,
                    { id: 'r-1' },
                    createAllowAllActor(),
                );

                expect(registryCaller.getCallCount()).toBe(1);
                expect(registryCaller.getCalls()[0].command).toBe('SETUP');
            });

            it('should call registryCaller for CLEANUP command', async () => {
                const registry = createTestRegistry({ id: 'r-1' });
                repository.seed(registry);

                await service.executeCommand(
                    RegistryAPICommand.CLEANUP,
                    { id: 'r-1' },
                    createAllowAllActor(),
                );

                expect(registryCaller.getCalls()[0].command).toBe('CLEANUP');
            });

            it('should throw NotFoundError when registry does not exist', async () => {
                await expect(
                    service.executeCommand(
                        RegistryAPICommand.SETUP,
                        { id: 'nonexistent' },
                        createAllowAllActor(),
                    ),
                ).rejects.toThrow(NotFoundError);
            });
        });

        describe('PROJECT_LINK/PROJECT_UNLINK', () => {
            it('should call registryCaller for PROJECT_LINK', async () => {
                const project = {
                    id: 'rp-1',
                    registry_id: 'r-1',
                    external_name: 'ext',
                    account_id: 'acc-1',
                } as RegistryProject;
                registryProjectRepository.seed(project);

                await service.executeCommand(
                    RegistryAPICommand.PROJECT_LINK,
                    { id: 'rp-1', secret: 'secret123' },
                    createAllowAllActor(),
                );

                expect(registryCaller.getCallCount()).toBe(1);
                expect(registryCaller.getCalls()[0].command).toBe('PROJECT_LINK');
            });

            it('should call registryCaller for PROJECT_UNLINK', async () => {
                const project = {
                    id: 'rp-1',
                    registry_id: 'r-1',
                    external_name: 'ext',
                    account_id: 'acc-1',
                } as RegistryProject;
                registryProjectRepository.seed(project);

                await service.executeCommand(
                    RegistryAPICommand.PROJECT_UNLINK,
                    { id: 'rp-1' },
                    createAllowAllActor(),
                );

                expect(registryCaller.getCalls()[0].command).toBe('PROJECT_UNLINK');
            });

            it('should throw NotFoundError when registry project does not exist', async () => {
                await expect(
                    service.executeCommand(
                        RegistryAPICommand.PROJECT_LINK,
                        { id: 'nonexistent' },
                        createAllowAllActor(),
                    ),
                ).rejects.toThrow(NotFoundError);
            });
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            await expect(
                service.executeCommand(
                    RegistryAPICommand.SETUP,
                    { id: 'r-1' },
                    createDenyAllActor(),
                ),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw BadRequestError when registryCaller is not available', async () => {
            const serviceWithoutCaller = new RegistryService({ repository });

            await expect(
                serviceWithoutCaller.executeCommand(
                    RegistryAPICommand.SETUP,
                    { id: 'r-1' },
                    createAllowAllActor(),
                ),
            ).rejects.toThrow(BadRequestError);
        });

        it('should throw BadRequestError for unknown command', async () => {
            await expect(
                service.executeCommand(
                    'unknown' as `${RegistryAPICommand}`,
                    { id: 'r-1' },
                    createAllowAllActor(),
                ),
            ).rejects.toThrow(BadRequestError);
        });
    });
});
