/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Analysis, AnalysisPermission } from '@privateaim/core-kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisPermissionService } from '../../../../../src/core/entities/analysis-permission/service.ts';
import type { FakePermissionChecker } from '../../helpers/index.ts';
import {
    FakeEntityRepository,
    createAllowAllActor,
    createDenyAllActor,
    createMasterRealmActor,
    createNonMasterRealmActor,
} from '../../helpers/index.ts';

function createFakeAnalysisPermissionRepository() {
    const repo = new FakeEntityRepository<AnalysisPermission>();

    const originalValidateJoinColumns = repo.validateJoinColumns.bind(repo);
    repo.validateJoinColumns = async (data: Partial<AnalysisPermission>) => {
        await originalValidateJoinColumns(data);

        if (!data.analysis) {
            data.analysis = {
                id: data.analysis_id,
                realm_id: 'realm-1',
            } as Analysis;
        }
    };

    return repo;
}

function createTestAnalysisPermission(overrides?: Partial<AnalysisPermission>): AnalysisPermission {
    return {
        id: randomUUID(),
        permission_id: randomUUID(),
        analysis_id: randomUUID(),
        analysis_realm_id: 'realm-1',
        policy_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...overrides,
    } as AnalysisPermission;
}

describe('AnalysisPermissionService', () => {
    let repository: FakeEntityRepository<AnalysisPermission>;
    let service: AnalysisPermissionService;

    beforeEach(() => {
        repository = createFakeAnalysisPermissionRepository();
        service = new AnalysisPermissionService({ repository });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            repository.seed([
                createTestAnalysisPermission({ id: 'ap-1' }),
                createTestAnalysisPermission({ id: 'ap-2' }),
            ]);

            const result = await service.getMany({});
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            const perm = createTestAnalysisPermission({ id: 'ap-1' });
            repository.seed(perm);

            const result = await service.getOne('ap-1');
            expect(result.id).toBe('ap-1');
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent')).rejects.toThrow(NotFoundError);
        });
    });

    describe('create', () => {
        it('should create with valid data', async () => {
            const analysisId = randomUUID();
            const permissionId = randomUUID();

            const result = await service.create(
                {
                    analysis_id: analysisId,
                    permission_id: permissionId,
                },
                createAllowAllActor(),
            );

            expect(result.analysis_id).toBe(analysisId);
            expect(result.permission_id).toBe(permissionId);
            expect(result.analysis_realm_id).toBe('realm-1');
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should check ANALYSIS_UPDATE permission', async () => {
            const actor = createAllowAllActor();

            await service.create(
                {
                    analysis_id: randomUUID(),
                    permission_id: randomUUID(),
                },
                actor,
            );

            expect((actor.permissionChecker as FakePermissionChecker).wasMethodCalled('preCheck')).toBe(true);
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            await expect(
                service.create(
                    {
                        analysis_id: randomUUID(),
                        permission_id: randomUUID(),
                    },
                    createDenyAllActor(),
                ),
            ).rejects.toThrow(ForbiddenError);
        });
    });

    describe('delete', () => {
        it('should delete existing entity', async () => {
            const perm = createTestAnalysisPermission();
            repository.seed(perm);

            const result = await service.delete(perm.id, createMasterRealmActor());
            expect(result.id).toBe(perm.id);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            const perm = createTestAnalysisPermission();
            repository.seed(perm);

            await expect(
                service.delete(perm.id, createDenyAllActor()),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should enforce realm writability for non-master realm', async () => {
            const perm = createTestAnalysisPermission({ analysis_realm_id: 'other-realm' });
            repository.seed(perm);

            await expect(
                service.delete(perm.id, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should allow master realm to delete any entity', async () => {
            const perm = createTestAnalysisPermission({ analysis_realm_id: 'other-realm' });
            repository.seed(perm);

            const result = await service.delete(perm.id, createMasterRealmActor());
            expect(result.id).toBe(perm.id);
        });
    });
});
