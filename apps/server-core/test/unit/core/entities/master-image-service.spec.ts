/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { MasterImage } from '@privateaim/core-kit';
import { MasterImageCommand } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { MasterImageService } from '../../../../src/core/entities/master-image/service.ts';
import {
    FakeEntityRepository,
    FakeMasterImageBuilderCaller,
    FakeMasterImageSynchronizerCaller,
    createAllowAllActor,
    createDenyAllActor,
} from '../helpers/index.ts';

function createTestMasterImage(overrides?: Partial<MasterImage>): MasterImage {
    return {
        id: randomUUID(),
        name: 'test-image',
        path: '/path/to/image',
        virtual_path: 'image/path',
        group_virtual_path: 'group/path',
        command: null,
        command_arguments: null,
        build_status: null,
        build_progress: null,
        build_hash: null,
        build_size: null,
        created_at: new Date(),
        updated_at: new Date(),
        ...overrides,
    } as MasterImage;
}

const masterImagesConfig = {
    owner: 'privateaim',
    repository: 'master-images',
    branch: 'main',
};

describe('MasterImageService', () => {
    let repository: FakeEntityRepository<MasterImage>;
    let synchronizerCaller: FakeMasterImageSynchronizerCaller;
    let builderCaller: FakeMasterImageBuilderCaller;
    let service: MasterImageService;

    beforeEach(() => {
        repository = new FakeEntityRepository<MasterImage>();
        synchronizerCaller = new FakeMasterImageSynchronizerCaller();
        builderCaller = new FakeMasterImageBuilderCaller();
        service = new MasterImageService({
            repository,
            synchronizerCaller,
            builderCaller,
            masterImagesConfig,
        });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            repository.seed([
                createTestMasterImage({ id: 'mi-1' }),
                createTestMasterImage({ id: 'mi-2' }),
            ]);

            const result = await service.getMany({});
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            const image = createTestMasterImage({ id: 'mi-1' });
            repository.seed(image);

            const result = await service.getOne('mi-1');
            expect(result.id).toBe('mi-1');
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent')).rejects.toThrow(NotFoundError);
        });
    });

    describe('executeCommand', () => {
        describe('SYNC', () => {
            it('should call synchronizerCaller with config', async () => {
                await service.executeCommand(
                    MasterImageCommand.SYNC,
                    {},
                    createAllowAllActor(),
                );

                expect(synchronizerCaller.getCallCount()).toBe(1);
                expect(synchronizerCaller.getCalls()[0]).toEqual(masterImagesConfig);
            });

            it('should return undefined for sync command', async () => {
                const result = await service.executeCommand(
                    MasterImageCommand.SYNC,
                    {},
                    createAllowAllActor(),
                );

                expect(result).toBeUndefined();
            });

            it('should throw ForbiddenError when actor lacks permission', async () => {
                await expect(
                    service.executeCommand(
                        MasterImageCommand.SYNC,
                        {},
                        createDenyAllActor(),
                    ),
                ).rejects.toThrow(ForbiddenError);
            });
        });

        describe('BUILD', () => {
            it('should call builderCaller and set build_status to STARTING', async () => {
                const image = createTestMasterImage({ id: 'mi-1' });
                repository.seed(image);

                const result = await service.executeCommand(
                    MasterImageCommand.BUILD,
                    { id: 'mi-1' },
                    createAllowAllActor(),
                );

                expect(result).toBeDefined();
                expect(result!.build_status).toBe(ProcessStatus.STARTING);
                expect(builderCaller.getCallCount()).toBe(1);
                expect(builderCaller.getCalls()[0]).toEqual({ id: 'mi-1' });
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

            it('should throw NotFoundError when image does not exist', async () => {
                await expect(
                    service.executeCommand(
                        MasterImageCommand.BUILD,
                        { id: 'nonexistent' },
                        createAllowAllActor(),
                    ),
                ).rejects.toThrow(NotFoundError);
            });

            it('should throw ForbiddenError when actor lacks permission', async () => {
                await expect(
                    service.executeCommand(
                        MasterImageCommand.BUILD,
                        { id: 'mi-1' },
                        createDenyAllActor(),
                    ),
                ).rejects.toThrow(ForbiddenError);
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

        it('should throw ForbiddenError when actor lacks permission', async () => {
            const image = createTestMasterImage();
            repository.seed(image);

            await expect(
                service.delete(image.id, createDenyAllActor()),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });
    });
});
