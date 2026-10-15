/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { BuiltInPolicyType } from '@authup/access';
import type { Analysis, AnalysisBucket, Node } from '@privateaim/core-kit';
import { AnalysisBucketType, AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import {
    BadRequestError,
    EntityConflictError,
    EntityNotFoundError,
    PermissionDeniedError,
} from '@privateaim/errors';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisBucketService } from '../../../../../src/core/entities/analysis-bucket/service.ts';
import { AnalysisReachService } from '../../../../../src/core/services/analysis-reach/index.ts';
import {
    FakeEntityRepository,
    createAllowAllActor,
    createDenyAllActor,
    createMasterRealmActor,
    createNonMasterRealmActor,
    createScopedActor,
} from '../../helpers/index.ts';
import { FakeAnalysisRepository } from '../analysis/fake-repository.ts';
import { FakeAnalysisNodeRepository } from '../analysis-node/fake-repository.ts';
import { createTestAnalysisNode } from '../../../../utils/domains/index.ts';

function createFakeAnalysisBucketRepository() {
    const repo = new FakeEntityRepository<AnalysisBucket>();

    const originalValidateJoinColumns = repo.validateJoinColumns.bind(repo);
    repo.validateJoinColumns = async (data: Partial<AnalysisBucket>) => {
        await originalValidateJoinColumns(data);

        if (!data.analysis) {
            data.analysis = {
                id: data.analysisId,
                realmId: 'realm-1',
            } as Analysis;
        }
    };

    return repo;
}

function createTestAnalysisBucket(overrides?: Partial<AnalysisBucket>): AnalysisBucket {
    const analysisId = overrides?.analysisId ?? randomUUID();
    const realmId = overrides?.realmId ?? 'realm-1';

    return {
        id: randomUUID(),
        type: AnalysisBucketType.CODE,
        bucketId: randomUUID(),
        analysisId,
        // the in-memory adapter resolves `analysis.realmId` through this object
        analysis: { id: analysisId, realmId } as Analysis,
        realmId,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    } as AnalysisBucket;
}

describe('AnalysisBucketService', () => {
    let repository: FakeEntityRepository<AnalysisBucket>;
    let analysisRepository: FakeAnalysisRepository;
    let analysisNodeRepository: FakeAnalysisNodeRepository;
    let service: AnalysisBucketService;

    beforeEach(() => {
        repository = createFakeAnalysisBucketRepository();
        analysisRepository = new FakeAnalysisRepository();
        analysisNodeRepository = new FakeAnalysisNodeRepository();
        service = new AnalysisBucketService({
            repository,
            analysisRepository,
            reach: new AnalysisReachService({
                analysisNodeRepository,
                analysisRepository,
                nodeRepository: new FakeEntityRepository<Node>(),
            }),
        });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            repository.seed([
                createTestAnalysisBucket({ id: 'ab-1' }),
                createTestAnalysisBucket({ id: 'ab-2' }),
            ]);

            const actor = createAllowAllActor();
            actor.permissionEvaluator.setCompileResult({ verdict: 'allow' });

            const result = await service.getMany({}, actor);
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
        });

        it('should show a pending node\'s realm the CODE bucket only, an approved one every bucket', async () => {
            repository.seed([
                createTestAnalysisBucket({
                    id: 'code', 
                    analysisId: 'a-1', 
                    realmId: 'realm-b', 
                    type: AnalysisBucketType.CODE, 
                }),
                createTestAnalysisBucket({
                    id: 'result', 
                    analysisId: 'a-1', 
                    realmId: 'realm-b', 
                    type: AnalysisBucketType.RESULT, 
                }),
                createTestAnalysisBucket({
                    id: 'temp', 
                    analysisId: 'a-1', 
                    realmId: 'realm-b', 
                    type: AnalysisBucketType.TEMP, 
                }),
                createTestAnalysisBucket({
                    id: 'foreign', 
                    analysisId: 'a-2', 
                    realmId: 'realm-c', 
                }),
            ]);
            analysisNodeRepository.seed(createTestAnalysisNode({
                id: 'an-1',
                analysisId: 'a-1',
                nodeRealmId: 'realm-a',
                approvalStatus: null,
            }));

            const pending = await service.getMany({}, createNonMasterRealmActor('realm-a'));
            expect(pending.data.map((e) => e.id)).toEqual(['code']);

            await analysisNodeRepository.save({
                ...(await analysisNodeRepository.findOneById('an-1')),
                approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
            });

            const approved = await service.getMany({}, createNonMasterRealmActor('realm-a'));
            expect(approved.data.map((e) => e.id).sort()).toEqual(['code', 'result', 'temp']);
        });

        it('should show the owner realm every bucket of its analyses', async () => {
            repository.seed([
                createTestAnalysisBucket({
                    id: 'code', 
                    analysisId: 'a-1', 
                    realmId: 'realm-a', 
                    type: AnalysisBucketType.CODE, 
                }),
                createTestAnalysisBucket({
                    id: 'result', 
                    analysisId: 'a-1', 
                    realmId: 'realm-a', 
                    type: AnalysisBucketType.RESULT, 
                }),
                createTestAnalysisBucket({
                    id: 'foreign', 
                    analysisId: 'a-2', 
                    realmId: 'realm-c', 
                    type: AnalysisBucketType.RESULT, 
                }),
            ]);

            const result = await service.getMany({}, createNonMasterRealmActor('realm-a'));
            expect(result.data.map((e) => e.id).sort()).toEqual(['code', 'result']);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            const bucket = createTestAnalysisBucket({ id: 'ab-1' });
            repository.seed(bucket);

            const result = await service.getOne('ab-1', createNonMasterRealmActor('realm-1'));
            expect(result.id).toBe('ab-1');
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent', createAllowAllActor())).rejects.toThrow(EntityNotFoundError);
        });

        it('should answer a RESULT bucket of a pending node\'s analysis like a missing one', async () => {
            repository.seed(createTestAnalysisBucket({
                id: 'result', 
                analysisId: 'a-1', 
                realmId: 'realm-b', 
                type: AnalysisBucketType.RESULT, 
            }));
            analysisNodeRepository.seed(createTestAnalysisNode({
                analysisId: 'a-1', 
                nodeRealmId: 'realm-a', 
                approvalStatus: null, 
            }));

            await expect(service.getOne('result', createNonMasterRealmActor('realm-a'))).rejects.toThrow(EntityNotFoundError);
        });
    });

    describe('create', () => {
        it('should create with valid data', async () => {
            const analysisId = randomUUID();
            const bucketId = randomUUID();

            const result = await service.create(
                {
                    analysisId,
                    bucketId,
                    type: AnalysisBucketType.CODE,
                },
                createAllowAllActor(),
            );

            expect(result.analysisId).toBe(analysisId);
            expect(result.bucketId).toBe(bucketId);
            expect(result.realmId).toBe('realm-1');
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should set realmId from analysis', async () => {
            const result = await service.create(
                {
                    analysisId: randomUUID(),
                    bucketId: randomUUID(),
                    type: AnalysisBucketType.RESULT,
                },
                createAllowAllActor(),
            );

            expect(result.realmId).toBe('realm-1');
        });

        it('should let the owner realm create', async () => {
            const result = await service.create(
                {
                    analysisId: randomUUID(), 
                    bucketId: randomUUID(), 
                    type: AnalysisBucketType.CODE, 
                },
                createNonMasterRealmActor('realm-1'),
            );

            expect(result.realmId).toBe('realm-1');
        });

        it('should deny a foreign realm', async () => {
            await expect(service.create(
                {
                    analysisId: randomUUID(), 
                    bucketId: randomUUID(), 
                    type: AnalysisBucketType.CODE, 
                },
                createScopedActor({ realmId: 'other-realm', realmScope: 'own' }),
            )).rejects.toThrow(PermissionDeniedError);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should reject a second bucket of the same type for an analysis', async () => {
            const existing = createTestAnalysisBucket({ type: AnalysisBucketType.CODE });
            repository.seed(existing);

            await expect(service.create(
                {
                    analysisId: existing.analysisId,
                    bucketId: randomUUID(),
                    type: AnalysisBucketType.CODE,
                },
                createAllowAllActor(),
            )).rejects.toThrow(EntityConflictError);
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should reject a storage bucket already bound to an analysis bucket', async () => {
            const existing = createTestAnalysisBucket({ type: AnalysisBucketType.RESULT });
            repository.seed(existing);

            await expect(service.create(
                {
                    analysisId: randomUUID(),
                    bucketId: existing.bucketId,
                    type: AnalysisBucketType.RESULT,
                },
                createAllowAllActor(),
            )).rejects.toThrow(EntityConflictError);
        });

        it('should deny without analysis_update', async () => {
            await expect(service.create(
                {
                    analysisId: randomUUID(), 
                    bucketId: randomUUID(), 
                    type: AnalysisBucketType.CODE, 
                },
                createDenyAllActor('realm-1'),
            )).rejects.toThrow(PermissionDeniedError);
        });
    });

    describe('update', () => {
        it('should update existing entity', async () => {
            const bucket = createTestAnalysisBucket();
            repository.seed(bucket);

            const result = await service.update(bucket.id, {}, createMasterRealmActor());
            expect(result.id).toBe(bucket.id);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.update('nonexistent', {}, createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should deny a bucket of a realm out of reach', async () => {
            const bucket = createTestAnalysisBucket({ realmId: 'other-realm' });
            repository.seed(bucket);

            await expect(
                service.update(bucket.id, {}, createScopedActor({ realmId: 'realm-1', realmScope: 'own' })),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should deny the owner realm without analysis_update', async () => {
            const bucket = createTestAnalysisBucket();
            repository.seed(bucket);

            await expect(
                service.update(bucket.id, {}, createDenyAllActor('realm-1')),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should evaluate both the stored and the merged row', async () => {
            const bucket = createTestAnalysisBucket();
            repository.seed(bucket);

            const actor = createScopedActor({ realmId: bucket.realmId, realmScope: 'own' });
            await service.update(bucket.id, {}, actor);

            expect(actor.permissionEvaluator.evaluateCalls.map((call) => call.data?.get(BuiltInPolicyType.REALM_MATCH)))
                .toEqual([bucket.realmId, bucket.realmId]);
        });

        it('should let a grant reaching every realm update any entity', async () => {
            const bucket = createTestAnalysisBucket({ realmId: 'other-realm' });
            repository.seed(bucket);

            const result = await service.update(bucket.id, {}, createScopedActor({ realmId: 'realm-master', realmScope: 'any' }));
            expect(result.id).toBe(bucket.id);
        });
    });

    describe('delete', () => {
        it('should delete existing entity', async () => {
            const bucket = createTestAnalysisBucket();
            repository.seed(bucket);

            const result = await service.delete(bucket.id, createMasterRealmActor());
            expect(result.id).toBe(bucket.id);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should deny a bucket of a realm out of reach', async () => {
            const bucket = createTestAnalysisBucket({ realmId: 'other-realm' });
            repository.seed(bucket);

            await expect(
                service.delete(bucket.id, createScopedActor({ realmId: 'realm-1', realmScope: 'own' })),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should deny the owner realm without analysis_update', async () => {
            const bucket = createTestAnalysisBucket();
            repository.seed(bucket);

            await expect(
                service.delete(bucket.id, createDenyAllActor('realm-1')),
            ).rejects.toThrow(PermissionDeniedError);
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should reject deleting a code bucket once the configuration is locked', async () => {
            const bucket = createTestAnalysisBucket({ type: AnalysisBucketType.CODE });
            repository.seed(bucket);
            analysisRepository.seed({ id: bucket.analysisId, configurationLocked: true } as Analysis);

            await expect(
                service.delete(bucket.id, createMasterRealmActor()),
            ).rejects.toThrow(BadRequestError);
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should delete a result bucket of a locked analysis', async () => {
            const bucket = createTestAnalysisBucket({ type: AnalysisBucketType.RESULT });
            repository.seed(bucket);
            analysisRepository.seed({ id: bucket.analysisId, configurationLocked: true } as Analysis);

            await service.delete(bucket.id, createMasterRealmActor());
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should let a grant reaching every realm delete any entity', async () => {
            const bucket = createTestAnalysisBucket({ realmId: 'other-realm' });
            repository.seed(bucket);

            const result = await service.delete(bucket.id, createScopedActor({ realmId: 'realm-master', realmScope: 'any' }));
            expect(result.id).toBe(bucket.id);
        });
    });
});
