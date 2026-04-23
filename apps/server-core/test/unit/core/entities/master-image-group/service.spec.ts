/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ForbiddenError, NotFoundError } from '@ebec/http';
import type { MasterImageGroup } from '@privateaim/core-kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { MasterImageGroupService } from '../../../../../src/core/entities/master-image-group/service.ts';
import {
    FakeEntityRepository,
    createAllowAllActor,
    createDenyAllActor,
} from '../../helpers/index.ts';

function createTestMasterImageGroup(overrides?: Partial<MasterImageGroup>): MasterImageGroup {
    return {
        id: 'mig-1',
        name: 'test-group',
        path: '/path/to/group',
        virtual_path: 'group/path',
        created_at: new Date(),
        updated_at: new Date(),
        ...overrides,
    };
}

describe('MasterImageGroupService', () => {
    let repository: FakeEntityRepository<MasterImageGroup>;
    let service: MasterImageGroupService;

    beforeEach(() => {
        repository = new FakeEntityRepository<MasterImageGroup>();
        service = new MasterImageGroupService({ repository });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            repository.seed([
                createTestMasterImageGroup({ id: 'mig-1' }),
                createTestMasterImageGroup({ id: 'mig-2' }),
            ]);

            const result = await service.getMany({});
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            repository.seed(createTestMasterImageGroup());

            const result = await service.getOne('mig-1');
            expect(result.id).toBe('mig-1');
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent')).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete with correct permission', async () => {
            repository.seed(createTestMasterImageGroup());

            const result = await service.delete('mig-1', createAllowAllActor());
            expect(result.id).toBe('mig-1');
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            repository.seed(createTestMasterImageGroup());

            await expect(
                service.delete('mig-1', createDenyAllActor()),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should preserve entity id after removal', async () => {
            repository.seed(createTestMasterImageGroup());

            const result = await service.delete('mig-1', createAllowAllActor());
            expect(result.id).toBe('mig-1');
        });
    });
});
