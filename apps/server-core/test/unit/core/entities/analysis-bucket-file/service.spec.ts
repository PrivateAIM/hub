/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type {
    Analysis,
    AnalysisBucket,
    AnalysisBucketFile,
    AnalysisNode,
} from '@privateaim/core-kit';
import { AnalysisBucketType, AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { BadRequestError, PermissionDeniedError } from '@privateaim/errors';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisBucketFileService } from '../../../../../src/core/entities/analysis-bucket-file/service.ts';
import {
    FakeEntityRepository,
    createAllowAllActor,
    createDenyAllActor,
    createMasterRealmActor,
    createNonMasterRealmActor,
} from '../../helpers/index.ts';
import { FakeAnalysisRepository } from '../analysis/fake-repository.ts';
import { FakeAnalysisNodeRepository } from '../analysis-node/fake-repository.ts';
import { FakeAnalysisBucketFileRepository } from './fake-repository.ts';
import { FakeAnalysisFileMetadataRecalculator } from './fake-metadata-recalculator.ts';

const OWNER_REALM = 'realm-owner';
const NODE_REALM = 'realm-node';

describe('AnalysisBucketFileService', () => {
    let repository: FakeAnalysisBucketFileRepository;
    let analysisRepository: FakeAnalysisRepository;
    let analysisBucketRepository: FakeEntityRepository<AnalysisBucket>;
    let analysisNodeRepository: FakeAnalysisNodeRepository;
    let recalculator: FakeAnalysisFileMetadataRecalculator;
    let service: AnalysisBucketFileService;
    let analysis: Analysis;
    let buckets: Record<AnalysisBucketType, AnalysisBucket>;

    beforeEach(() => {
        repository = new FakeAnalysisBucketFileRepository();
        analysisRepository = new FakeAnalysisRepository();
        analysisBucketRepository = new FakeEntityRepository<AnalysisBucket>();
        analysisNodeRepository = new FakeAnalysisNodeRepository();
        recalculator = new FakeAnalysisFileMetadataRecalculator(analysisRepository);

        analysis = {
            id: randomUUID(), 
            realmId: OWNER_REALM, 
            configurationLocked: false, 
        } as Analysis;
        analysisRepository.seed(analysis);

        buckets = {} as Record<AnalysisBucketType, AnalysisBucket>;
        for (const type of Object.values(AnalysisBucketType)) {
            buckets[type] = {
                id: randomUUID(),
                type,
                bucketId: randomUUID(),
                analysisId: analysis.id,
                realmId: OWNER_REALM,
            } as AnalysisBucket;
            analysisBucketRepository.seed(buckets[type]);
        }

        service = new AnalysisBucketFileService({
            repository,
            recalculator,
            analysisRepository,
            analysisBucketRepository,
            analysisNodeRepository,
        });
    });

    function createPayload(type: AnalysisBucketType, root = false): Partial<AnalysisBucketFile> {
        return {
            analysisBucketId: buckets[type].id,
            path: 'main.py',
            bucketId: buckets[type].bucketId,
            bucketFileId: randomUUID(),
            root,
        };
    }

    function seedFile(type: AnalysisBucketType, overrides?: Partial<AnalysisBucketFile>): AnalysisBucketFile {
        const file = {
            id: randomUUID(),
            path: 'main.py',
            root: false,
            analysisId: analysis.id,
            analysisBucketId: buckets[type].id,
            bucketId: buckets[type].bucketId,
            bucketFileId: randomUUID(),
            realmId: OWNER_REALM,
            userId: null,
            robotId: null,
            clientId: null,
            ...overrides,
        } as AnalysisBucketFile;
        repository.seed(file);
        return file;
    }

    function seedAnalysisNode(approvalStatus: AnalysisNodeApprovalStatus | null) {
        analysisNodeRepository.seed({
            id: randomUUID(),
            analysisId: analysis.id,
            nodeRealmId: NODE_REALM,
            analysisRealmId: OWNER_REALM,
            approvalStatus,
        } as AnalysisNode);
    }

    describe('create', () => {
        it('should stamp the analysis realm, not the actor realm', async () => {
            const result = await service.create(createPayload(AnalysisBucketType.CODE), createMasterRealmActor());

            expect(result.realmId).toBe(OWNER_REALM);
            expect(result.analysisId).toBe(analysis.id);
        });

        it('should let the owner realm add a code file', async () => {
            const result = await service.create(createPayload(AnalysisBucketType.CODE), createNonMasterRealmActor(OWNER_REALM));

            expect(result.realmId).toBe(OWNER_REALM);
        });

        it('should deny a code file from a foreign realm', async () => {
            await expect(
                service.create(createPayload(AnalysisBucketType.CODE), createNonMasterRealmActor(NODE_REALM)),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should deny a code file without analysis_update', async () => {
            await expect(
                service.create(createPayload(AnalysisBucketType.CODE), createDenyAllActor(OWNER_REALM)),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should reject a code file once the configuration is locked', async () => {
            analysis.configurationLocked = true;

            await expect(
                service.create(createPayload(AnalysisBucketType.CODE), createMasterRealmActor()),
            ).rejects.toThrow(BadRequestError);
        });

        it.each([AnalysisBucketType.RESULT, AnalysisBucketType.TEMP])('should let master add a %s file', async (type) => {
            const result = await service.create(createPayload(type), createMasterRealmActor());

            expect(result.realmId).toBe(OWNER_REALM);
        });

        it.each([AnalysisBucketType.RESULT, AnalysisBucketType.TEMP])('should let an approved node realm add a %s file', async (type) => {
            seedAnalysisNode(AnalysisNodeApprovalStatus.APPROVED);

            const result = await service.create(createPayload(type), createNonMasterRealmActor(NODE_REALM));

            expect(result.realmId).toBe(OWNER_REALM);
        });

        it.each([AnalysisBucketType.RESULT, AnalysisBucketType.TEMP])('should deny a pending node realm a %s file', async (type) => {
            seedAnalysisNode(null);

            await expect(
                service.create(createPayload(type), createNonMasterRealmActor(NODE_REALM)),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should deny the owner realm a result file without node participation', async () => {
            await expect(
                service.create(createPayload(AnalysisBucketType.RESULT), createNonMasterRealmActor(OWNER_REALM)),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should deny root on a result file to a non-participant before validating it', async () => {
            await expect(
                service.create(createPayload(AnalysisBucketType.RESULT, true), createNonMasterRealmActor(NODE_REALM)),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should reject a storage bucket other than the analysis bucket\'s', async () => {
            await expect(
                service.create({ ...createPayload(AnalysisBucketType.CODE), bucketId: randomUUID() }, createMasterRealmActor()),
            ).rejects.toThrow(BadRequestError);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should reject root on a result file', async () => {
            await expect(
                service.create(createPayload(AnalysisBucketType.RESULT, true), createMasterRealmActor()),
            ).rejects.toThrow(BadRequestError);
        });

        it('should call recalc for root file', async () => {
            await service.create(createPayload(AnalysisBucketType.CODE, true), createAllowAllActor());

            expect(recalculator.getCallCount()).toBe(1);
            expect(recalculator.getCalls()[0]).toBe(analysis.id);
        });

        it('should not call recalc for non-root file', async () => {
            await service.create(createPayload(AnalysisBucketType.CODE), createAllowAllActor());

            expect(recalculator.getCallCount()).toBe(0);
        });
    });

    describe('update', () => {
        it('should let the owner realm update a code file', async () => {
            const file = seedFile(AnalysisBucketType.CODE);

            const result = await service.update(file.id, { root: true }, createNonMasterRealmActor(OWNER_REALM));
            expect(result.root).toBe(true);
        });

        it('should check the analysis realm, not the writer realm', async () => {
            const file = seedFile(AnalysisBucketType.CODE, { realmId: NODE_REALM });

            await expect(
                service.update(file.id, { path: 'x.py' }, createNonMasterRealmActor(NODE_REALM)),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should deny an update without analysis_update', async () => {
            const file = seedFile(AnalysisBucketType.CODE);

            await expect(
                service.update(file.id, { path: 'x.py' }, createDenyAllActor(OWNER_REALM)),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should reject a code file update once locked', async () => {
            const file = seedFile(AnalysisBucketType.CODE);
            analysis.configurationLocked = true;

            await expect(
                service.update(file.id, { path: 'x.py' }, createMasterRealmActor()),
            ).rejects.toThrow(BadRequestError);
        });

        it('should reject root on a result file', async () => {
            const file = seedFile(AnalysisBucketType.RESULT);

            await expect(
                service.update(file.id, { root: true }, createMasterRealmActor()),
            ).rejects.toThrow(BadRequestError);
        });

        it('should deny the owner realm a temp file update', async () => {
            const file = seedFile(AnalysisBucketType.TEMP);

            await expect(
                service.update(file.id, { path: 'x.py' }, createNonMasterRealmActor(OWNER_REALM)),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should call recalcDebounced after save', async () => {
            const file = seedFile(AnalysisBucketType.CODE);

            await service.update(file.id, { path: 'updated.py' }, createAllowAllActor());

            expect(recalculator.getDebouncedCallCount()).toBe(1);
            expect(recalculator.getDebouncedCalls()[0]).toBe(analysis.id);
            expect(recalculator.getCallCount()).toBe(0);
        });
    });

    describe('delete', () => {
        it('should let the owner realm delete a code file', async () => {
            const file = seedFile(AnalysisBucketType.CODE);

            await service.delete(file.id, createNonMasterRealmActor(OWNER_REALM));
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should deny a foreign realm', async () => {
            const file = seedFile(AnalysisBucketType.CODE, { realmId: NODE_REALM });

            await expect(
                service.delete(file.id, createNonMasterRealmActor(NODE_REALM)),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should deny without analysis_update', async () => {
            const file = seedFile(AnalysisBucketType.RESULT);

            await expect(
                service.delete(file.id, createDenyAllActor(OWNER_REALM)),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should reject a code file delete once locked', async () => {
            const file = seedFile(AnalysisBucketType.CODE);
            analysis.configurationLocked = true;

            await expect(
                service.delete(file.id, createMasterRealmActor()),
            ).rejects.toThrow(BadRequestError);
        });

        it('should let the owner realm delete a result file after lock', async () => {
            const file = seedFile(AnalysisBucketType.RESULT);
            analysis.configurationLocked = true;

            await service.delete(file.id, createNonMasterRealmActor(OWNER_REALM));
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should deny the owner realm a temp file delete', async () => {
            const file = seedFile(AnalysisBucketType.TEMP);

            await expect(
                service.delete(file.id, createNonMasterRealmActor(OWNER_REALM)),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should let master delete a temp file', async () => {
            const file = seedFile(AnalysisBucketType.TEMP);

            await service.delete(file.id, createMasterRealmActor());
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should call recalc for root file', async () => {
            const file = seedFile(AnalysisBucketType.CODE, { root: true });

            await service.delete(file.id, createAllowAllActor());

            expect(recalculator.getCallCount()).toBe(1);
            expect(recalculator.getCalls()[0]).toBe(analysis.id);
        });

        it('should not call recalc for non-root file', async () => {
            const file = seedFile(AnalysisBucketType.CODE);

            await service.delete(file.id, createAllowAllActor());

            expect(recalculator.getCallCount()).toBe(0);
        });
    });
});
