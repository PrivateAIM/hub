/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { MasterImageGroup } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { MasterImageGroupService } from '../../../../../src/core/entities/master-image-group/service.ts';
import { FakeEntityRepository, createAllowAllActor, createDenyAllActor } from '@privateaim/server-test-kit';

const READ_PERMISSIONS = [PermissionName.MASTER_IMAGE_GROUP_READ, PermissionName.MASTER_IMAGE_GROUP_MANAGE];

function createTestMasterImageGroup(overrides?: Partial<MasterImageGroup>): MasterImageGroup {
    return {
        id: 'mig-1',
        name: 'test-group',
        path: '/path/to/group',
        virtualPath: 'group/path',
        createdAt: new Date(),
        updatedAt: new Date(),
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

            const actor = createAllowAllActor();
            const result = await service.getMany({}, actor);
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
            expect(actor.permissionEvaluator.preEvaluateOneOfCalls[0]).toEqual({ name: READ_PERMISSIONS });
            expect(actor.permissionEvaluator.compileCalls).toHaveLength(0);
        });

        it('should reject without a read permission', async () => {
            await expect(service.getMany({}, createDenyAllActor())).rejects.toThrow(PermissionDeniedError);
            expect(repository.findManyCalls).toHaveLength(0);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            repository.seed(createTestMasterImageGroup());

            const actor = createAllowAllActor();
            const result = await service.getOne('mig-1', actor);
            expect(result.id).toBe('mig-1');
            expect(actor.permissionEvaluator.preEvaluateOneOfCalls[0]).toEqual({ name: READ_PERMISSIONS });
            expect(actor.permissionEvaluator.compileCalls).toHaveLength(0);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent', createAllowAllActor())).rejects.toThrow(EntityNotFoundError);
        });

        it('should reject without a read permission', async () => {
            repository.seed(createTestMasterImageGroup());

            await expect(service.getOne('mig-1', createDenyAllActor())).rejects.toThrow(PermissionDeniedError);
        });
    });

    describe('delete', () => {
        it('should delete with correct permission', async () => {
            repository.seed(createTestMasterImageGroup());

            const result = await service.delete('mig-1', createAllowAllActor());
            expect(result.id).toBe('mig-1');
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should throw PermissionDeniedError when actor lacks permission', async () => {
            repository.seed(createTestMasterImageGroup());

            await expect(
                service.delete('mig-1', createDenyAllActor()),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should preserve entity id after removal', async () => {
            repository.seed(createTestMasterImageGroup());

            const result = await service.delete('mig-1', createAllowAllActor());
            expect(result.id).toBe('mig-1');
        });
    });
});
