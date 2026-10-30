/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionError } from '@authup/access';
import { randomUUID } from 'node:crypto';
import type { MasterImage } from '@privateaim/core-kit';
import { MasterImageCommand } from '@privateaim/core-kit';
import { PermissionName, ProcessStatus } from '@privateaim/kit';
import { BadRequestError, EntityNotFoundError } from '@privateaim/errors';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { MasterImageService } from '../../../../../src/core/entities/master-image/service.ts';
import { createAllowAllActor, createDenyAllActor } from '@privateaim/server-test-kit';
import { FakeMasterImageRepository } from './fake-repository.ts';
import { FakeMasterImageBuilderDispatcher } from './fake-builder-dispatcher.ts';
import { FakeMasterImageSynchronizerDispatcher } from './fake-synchronizer-dispatcher.ts';

const READ_PERMISSIONS = [PermissionName.MASTER_IMAGE_READ, PermissionName.MASTER_IMAGE_MANAGE];

function createTestMasterImage(overrides?: Partial<MasterImage>): MasterImage {
    return {
        id: randomUUID(),
        name: 'test-image',
        path: '/path/to/image',
        virtualPath: 'image/path',
        groupVirtualPath: 'group/path',
        command: null,
        commandArguments: null,
        buildStatus: null,
        buildProgress: null,
        buildHash: null,
        buildSize: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    } as MasterImage;
}

const masterImagesConfig = {
    owner: 'privateaim',
    repository: 'master-images',
    branch: 'main',
};

describe('MasterImageService', () => {
    let repository: FakeMasterImageRepository;
    let synchronizerDispatcher: FakeMasterImageSynchronizerDispatcher;
    let builderDispatcher: FakeMasterImageBuilderDispatcher;
    let service: MasterImageService;

    beforeEach(() => {
        repository = new FakeMasterImageRepository();
        synchronizerDispatcher = new FakeMasterImageSynchronizerDispatcher();
        builderDispatcher = new FakeMasterImageBuilderDispatcher();
        service = new MasterImageService({
            repository,
            synchronizerDispatcher,
            builderDispatcher,
            masterImagesConfig,
        });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            repository.seed([
                createTestMasterImage({ id: 'mi-1' }),
                createTestMasterImage({ id: 'mi-2' }),
            ]);

            const actor = createAllowAllActor();
            const result = await service.getMany({}, actor);

            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
            expect(actor.permissionEvaluator.preEvaluateOneOfCalls[0]).toEqual({ name: READ_PERMISSIONS });
            expect(actor.permissionEvaluator.compileCalls).toHaveLength(0);
        });

        it('should reject without a read permission', async () => {
            await expect(service.getMany({}, createDenyAllActor())).rejects.toThrow(PermissionError);
            expect(repository.findManyCalls).toHaveLength(0);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            const image = createTestMasterImage({ id: 'mi-1' });

            repository.seed(image);

            const actor = createAllowAllActor();
            const result = await service.getOne('mi-1', actor);

            expect(result.id).toBe('mi-1');
            expect(actor.permissionEvaluator.preEvaluateOneOfCalls[0]).toEqual({ name: READ_PERMISSIONS });
            expect(actor.permissionEvaluator.compileCalls).toHaveLength(0);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent', createAllowAllActor())).rejects.toThrow(EntityNotFoundError);
        });

        it('should reject without a read permission', async () => {
            repository.seed(createTestMasterImage({ id: 'mi-1' }));

            await expect(service.getOne('mi-1', createDenyAllActor())).rejects.toThrow(PermissionError);
        });
    });

    describe('executeCommand', () => {
        describe('SYNC', () => {
            it('should call synchronizerDispatcher with config', async () => {
                await service.executeCommand(
                    MasterImageCommand.SYNC,
                    {},
                    createAllowAllActor(),
                );

                expect(synchronizerDispatcher.getCallCount()).toBe(1);
                expect(synchronizerDispatcher.getCalls()[0]).toEqual(masterImagesConfig);
            });

            it('should return undefined for sync command', async () => {
                const result = await service.executeCommand(
                    MasterImageCommand.SYNC,
                    {},
                    createAllowAllActor(),
                );

                expect(result).toBeUndefined();
            });

            it('should deny when actor lacks permission', async () => {
                await expect(
                    service.executeCommand(
                        MasterImageCommand.SYNC,
                        {},
                        createDenyAllActor(),
                    ),
                ).rejects.toThrow(PermissionError);
            });
        });

        describe('BUILD', () => {
            it('should call builderDispatcher and set buildStatus to STARTING', async () => {
                const image = createTestMasterImage({ id: 'mi-1' });

                repository.seed(image);

                const result = await service.executeCommand(
                    MasterImageCommand.BUILD,
                    { id: 'mi-1' },
                    createAllowAllActor(),
                );

                expect(result).toBeDefined();
                expect(result!.buildStatus).toBe(ProcessStatus.STARTING);
                expect(builderDispatcher.getCallCount()).toBe(1);
                expect(builderDispatcher.getCalls()[0]).toEqual({ id: 'mi-1' });
            });

            it('should reject a second build while the first is starting', async () => {
                repository.seed(createTestMasterImage({ id: 'mi-1', buildStatus: ProcessStatus.EXECUTED }));
                await service.executeCommand(MasterImageCommand.BUILD, { id: 'mi-1' }, createAllowAllActor());
                await expect(
                    service.executeCommand(MasterImageCommand.BUILD, { id: 'mi-1' }, createAllowAllActor()),
                ).rejects.toThrow(BadRequestError);

                expect(builderDispatcher.getCallCount()).toBe(1);
                expect(repository.getAll()[0].buildStatus).toBe(ProcessStatus.STARTING);
            });

            it('should take over a starting claim older than the stale threshold', async () => {
                repository.seed(createTestMasterImage({
                    id: 'mi-1',
                    buildStatus: ProcessStatus.STARTING,
                    updatedAt: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
                }));

                await service.executeCommand(MasterImageCommand.BUILD, { id: 'mi-1' }, createAllowAllActor());
                await expect(
                    service.executeCommand(MasterImageCommand.BUILD, { id: 'mi-1' }, createAllowAllActor()),
                ).rejects.toThrow(BadRequestError);

                expect(builderDispatcher.getCallCount()).toBe(1);
            });

            it('should reject another build while the first is started', async () => {
                repository.seed(createTestMasterImage({ id: 'mi-1', buildStatus: ProcessStatus.STARTED }));

                await expect(
                    service.executeCommand(MasterImageCommand.BUILD, { id: 'mi-1' }, createAllowAllActor()),
                ).rejects.toThrow(BadRequestError);

                expect(repository.getAll()[0].buildStatus).toBe(ProcessStatus.STARTED);
                expect(builderDispatcher.getCallCount()).toBe(0);
            });

            it('should allow takeover of a stale started build', async () => {
                repository.seed(createTestMasterImage({
                    id: 'mi-1',
                    buildStatus: ProcessStatus.STARTED,
                    updatedAt: new Date(Date.now() - 16 * 60 * 1000),
                }));

                const result = await service.executeCommand(
                    MasterImageCommand.BUILD,
                    { id: 'mi-1' },
                    createAllowAllActor(),
                );

                expect(result?.buildStatus).toBe(ProcessStatus.STARTING);
                expect(builderDispatcher.getCallCount()).toBe(1);
            });

            it('should restore buildStatus when the dispatch fails', async () => {
                repository.seed(createTestMasterImage({ id: 'mi-1', buildStatus: ProcessStatus.EXECUTED }));
                builderDispatcher.failWith = new Error('broker unavailable');

                await expect(
                    service.executeCommand(
                        MasterImageCommand.BUILD,
                        { id: 'mi-1' },
                        createAllowAllActor(),
                    ),
                ).rejects.toThrow('broker unavailable');

                expect(repository.getAll()[0].buildStatus).toBe(ProcessStatus.EXECUTED);
            });

            it('should not revert a status a worker event already advanced', async () => {
                repository.seed(createTestMasterImage({ id: 'mi-1', buildStatus: ProcessStatus.EXECUTED }));
                builderDispatcher.failWith = new Error('publish confirm timed out');
                // the broker took the message after all, and the worker already reported
                builderDispatcher.onExecute = async () => {
                    await repository.save({ ...repository.getAll()[0], buildStatus: ProcessStatus.STARTED });
                };

                await expect(
                    service.executeCommand(
                        MasterImageCommand.BUILD,
                        { id: 'mi-1' },
                        createAllowAllActor(),
                    ),
                ).rejects.toThrow('publish confirm timed out');

                expect(repository.getAll()[0].buildStatus).toBe(ProcessStatus.STARTED);
            });

            it('should throw BadRequestError when id is missing', async () => {
                await expect(
                    service.executeCommand(
                        MasterImageCommand.BUILD,
                        {},
                        createAllowAllActor(),
                    ),
                ).rejects.toThrow(BadRequestError);
            });

            it('should throw EntityNotFoundError when image does not exist', async () => {
                await expect(
                    service.executeCommand(
                        MasterImageCommand.BUILD,
                        { id: 'nonexistent' },
                        createAllowAllActor(),
                    ),
                ).rejects.toThrow(EntityNotFoundError);
            });

            it('should deny when actor lacks permission', async () => {
                await expect(
                    service.executeCommand(
                        MasterImageCommand.BUILD,
                        { id: 'mi-1' },
                        createDenyAllActor(),
                    ),
                ).rejects.toThrow(PermissionError);
            });
        });

        it('should throw BadRequestError for unknown command', async () => {
            await expect(
                service.executeCommand(
                    'unknown' as `${MasterImageCommand}`,
                    {},
                    createAllowAllActor(),
                ),
            ).rejects.toThrow(BadRequestError);
        });
    });

    describe('delete', () => {
        it('should delete with correct permission', async () => {
            const image = createTestMasterImage();

            repository.seed(image);

            const result = await service.delete(image.id, createAllowAllActor());

            expect(result.id).toBe(image.id);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should deny when actor lacks permission', async () => {
            const image = createTestMasterImage();

            repository.seed(image);

            await expect(
                service.delete(image.id, createDenyAllActor()),
            ).rejects.toThrow(PermissionError);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });
    });
});
