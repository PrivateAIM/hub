/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import { MasterImageBuilderEvent } from '@privateaim/server-core-worker-kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { MasterImageBuilderService } from '../../../../src/core/services/master-image/index.ts';
import { FakeMasterImageRepository } from '../entities/master-image/fake-repository.ts';

describe('MasterImageBuilderService', () => {
    let imageRepository: FakeMasterImageRepository;
    let service: MasterImageBuilderService;

    beforeEach(() => {
        imageRepository = new FakeMasterImageRepository();
        service = new MasterImageBuilderService({ imageRepository });
    });

    function seedImage(overrides: Partial<MasterImage> = {}): MasterImage {
        return imageRepository.seed(imageRepository.create({
            name: 'base',
            path: 'python/base',
            virtualPath: 'python/base',
            groupVirtualPath: 'python',
            ...overrides,
        }));
    }

    function createProgressPayload(id: string, percent: number) {
        return {
            id,
            progress: {
                current: 1,
                total: 1,
                percent,
            },
        };
    }

    it.each([null, ...Object.values(ProcessStatus)])('applies events only to active status %s', async (status) => {
        const active = status === ProcessStatus.STARTING || status === ProcessStatus.STARTED;
        const cases = [
            {
                event: MasterImageBuilderEvent.EXECUTION_STARTED,
                status: ProcessStatus.STARTED,
                progress: 0,
            },
            {
                event: MasterImageBuilderEvent.EXECUTION_PROGRESS,
                status,
                progress: 40,
            },
            {
                event: MasterImageBuilderEvent.EXECUTION_FAILED,
                status: ProcessStatus.FAILED,
                progress: 20,
            },
            {
                event: MasterImageBuilderEvent.EXECUTION_FINISHED,
                status: ProcessStatus.EXECUTED,
                progress: 100,
            },
        ];

        for (const testCase of cases) {
            const image = seedImage({ buildStatus: status, buildProgress: 20 });
            const saved = await service.applyEvent(testCase.event, createProgressPayload(image.id, 40));
            const stored = await imageRepository.findOneById(image.id);

            if (active) {
                expect(saved).not.toBeNull();
                expect(stored?.buildStatus).toBe(testCase.status);
                expect(stored?.buildProgress).toBe(testCase.progress);
            } else {
                expect(saved).toBeNull();
                expect(stored?.buildStatus).toBe(status);
                expect(stored?.buildProgress).toBe(20);
            }
        }
    });

    it('should apply progress to a running build', async () => {
        const image = seedImage({ buildStatus: ProcessStatus.STARTED, buildProgress: 20 });

        const saved = await service.applyEvent(MasterImageBuilderEvent.EXECUTION_PROGRESS, createProgressPayload(image.id, 40));

        expect(saved?.buildProgress).toBe(40);
        expect((await imageRepository.findOneById(image.id))?.buildProgress).toBe(40);
    });

    it('should ignore a late progress event for a terminal build and resolve null', async () => {
        const image = seedImage({ buildStatus: ProcessStatus.EXECUTED, buildProgress: 100 });

        const saved = await service.applyEvent(MasterImageBuilderEvent.EXECUTION_PROGRESS, createProgressPayload(image.id, 40));

        expect(saved).toBeNull();
        expect(await imageRepository.findOneById(image.id)).toMatchObject({
            buildStatus: ProcessStatus.EXECUTED,
            buildProgress: 100,
        });
    });

    it('should mark the build as EXECUTED on EXECUTION_FINISHED', async () => {
        const image = seedImage({ buildStatus: ProcessStatus.STARTED, buildProgress: 20 });

        const saved = await service.applyEvent(MasterImageBuilderEvent.EXECUTION_FINISHED, { id: image.id });

        expect(saved).toMatchObject({
            buildStatus: ProcessStatus.EXECUTED,
            buildProgress: 100,
        });
    });

    it('should resolve null for a missing image', async () => {
        expect(await service.applyEvent(MasterImageBuilderEvent.EXECUTION_FAILED, { id: 'missing' })).toBeNull();
    });
});
