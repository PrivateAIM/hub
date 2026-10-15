/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MasterImageGroup } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import { FakeEntityRepository } from '@privateaim/server-test-kit';
import { describe, expect, it } from 'vitest';
import { MasterImageSynchronizerService } from '../../../../src/core/services/master-image/index.ts';
import { FakeMasterImageRepository } from '../entities/master-image/fake-repository.ts';

describe('MasterImageSynchronizerService', () => {
    it('should update an image without reverting a build transition committed meanwhile', async () => {
        const imageRepository = new FakeMasterImageRepository();
        imageRepository.seed({
            id: 'image-1',
            name: 'old',
            path: 'python/base',
            virtualPath: 'python/base',
            groupVirtualPath: 'python',
            command: 'python',
            buildStatus: ProcessStatus.STARTED,
        });

        // the build finishes while the sync still holds its earlier read
        imageRepository.afterUnlockedRead = async () => {
            const [row] = imageRepository.getAll();
            await imageRepository.save({ ...row, buildStatus: ProcessStatus.EXECUTED });
        };

        const service = new MasterImageSynchronizerService({
            imageRepository,
            groupRepository: new FakeEntityRepository<MasterImageGroup>(),
        });

        await service.sync({
            groups: [],
            images: [{
                name: 'new',
                path: 'python/base',
                virtualPath: 'python/base',
                command: 'python',
            }],
        });

        expect(imageRepository.getAll()[0]).toMatchObject({
            name: 'new',
            buildStatus: ProcessStatus.EXECUTED,
        });
    });
});
