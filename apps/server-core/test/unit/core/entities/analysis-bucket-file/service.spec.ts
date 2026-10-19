/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { BuiltInPolicyType, PermissionError } from '@authup/access';
import type {
    Analysis,
    AnalysisBucket,
    AnalysisBucketFile,
    AnalysisNode,
    Node,
} from '@privateaim/core-kit';
import { AnalysisBucketType, AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import { PermissionName } from '@privateaim/kit';
import { eq } from '@rapiq/core';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisBucketFileService } from '../../../../../src/core/entities/analysis-bucket-file/service.ts';
import { AnalysisReachService } from '../../../../../src/core/services/analysis-reach/index.ts';
import {
    FakeEntityRepository,
    FakePermissionEvaluator,
    createAllowAllActor,
    createDenyAllActor,
    createScopedActor,
} from '@privateaim/server-test-kit';
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
            reach: new AnalysisReachService({
                analysisNodeRepository,
                analysisRepository,
                nodeRepository: new FakeEntityRepository<Node>(),
            }),
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
            // the in-memory adapter resolves `analysis.*` / `analysisBucket.type` through these
            analysis,
            analysisBucketId: buckets[type].id,
            analysisBucket: buckets[type],
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

    /** The system: grants reaching every realm unconditionally. */
    function createSystemActor() {
        return createScopedActor({ realmId: 'realm-master', realmScope: 'any' });
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
            const result = await service.create(createPayload(AnalysisBucketType.CODE), createAllowAllActor());

            expect(result.realmId).toBe(OWNER_REALM);
            expect(result.analysisId).toBe(analysis.id);
        });

        it('should let the owner realm add a code file', async () => {
            const result = await service.create(createPayload(AnalysisBucketType.CODE), createAllowAllActor(OWNER_REALM));

            expect(result.realmId).toBe(OWNER_REALM);
        });

        it('should deny a code file from a foreign realm', async () => {
            await expect(
                service.create(createPayload(AnalysisBucketType.CODE), createScopedActor({ realmId: NODE_REALM, realmScope: 'own' })),
            ).rejects.toThrow(PermissionError);
        });

        it('should deny a code file without analysis_update', async () => {
            await expect(
                service.create(createPayload(AnalysisBucketType.CODE), createDenyAllActor(OWNER_REALM)),
            ).rejects.toThrow(PermissionError);
        });

        it('should reject a code file once the configuration is locked', async () => {
            analysis.configurationLocked = true;

            await expect(
                service.create(createPayload(AnalysisBucketType.CODE), createAllowAllActor()),
            ).rejects.toThrow(BadRequestError);
        });

        it.each([AnalysisBucketType.RESULT, AnalysisBucketType.TEMP])('should let the system add a %s file', async (type) => {
            const result = await service.create(createPayload(type), createSystemActor());

            expect(result.realmId).toBe(OWNER_REALM);
        });

        it.each([AnalysisBucketType.RESULT, AnalysisBucketType.TEMP])('should let an approved node realm add a %s file', async (type) => {
            seedAnalysisNode(AnalysisNodeApprovalStatus.APPROVED);

            const result = await service.create(createPayload(type), createAllowAllActor(NODE_REALM));

            expect(result.realmId).toBe(OWNER_REALM);
        });

        it.each([AnalysisBucketType.RESULT, AnalysisBucketType.TEMP])('should deny a pending node realm a %s file', async (type) => {
            seedAnalysisNode(null);

            await expect(
                service.create(createPayload(type), createAllowAllActor(NODE_REALM)),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should let the analysis client add a result file', async () => {
            const actor = createAllowAllActor(OWNER_REALM);
            actor.identity = { id: randomUUID(), type: 'client' };
            analysis.clientId = actor.identity.id;

            const entity = await service.create(createPayload(AnalysisBucketType.RESULT), actor);
            expect(entity.clientId).toBe(actor.identity.id);
        });

        it('should deny another client of the owner realm a result file', async () => {
            const actor = createAllowAllActor(OWNER_REALM);
            actor.identity = { id: randomUUID(), type: 'client' };
            analysis.clientId = randomUUID();

            await expect(
                service.create(createPayload(AnalysisBucketType.RESULT), actor),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should deny the owner realm a result file without node participation', async () => {
            await expect(
                service.create(createPayload(AnalysisBucketType.RESULT), createAllowAllActor(OWNER_REALM)),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should deny root on a result file to a non-participant before validating it', async () => {
            await expect(
                service.create(createPayload(AnalysisBucketType.RESULT, true), createAllowAllActor(NODE_REALM)),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should reject a storage bucket other than the analysis bucket\'s', async () => {
            await expect(
                service.create({ ...createPayload(AnalysisBucketType.CODE), bucketId: randomUUID() }, createAllowAllActor()),
            ).rejects.toThrow(BadRequestError);
            expect(repository.getAll()).toHaveLength(0);
        });

        it.each([AnalysisBucketType.RESULT, AnalysisBucketType.TEMP])('should deny a %s file to a realm-scoped grant without participation', async (type) => {
            await expect(
                service.create(createPayload(type), createScopedActor({ realmId: OWNER_REALM, realmScope: 'own' })),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should reject root on a result file', async () => {
            await expect(
                service.create(createPayload(AnalysisBucketType.RESULT, true), createSystemActor()),
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

            const result = await service.update(file.id, { root: true }, createAllowAllActor(OWNER_REALM));
            expect(result.root).toBe(true);
        });

        it('should evaluate both the stored and the merged row', async () => {
            const file = seedFile(AnalysisBucketType.CODE);

            const actor = createScopedActor({ realmId: OWNER_REALM, realmScope: 'own' });
            await service.update(file.id, { path: 'renamed.py' }, actor);

            expect(actor.permissionEvaluator.evaluateCalls.map((call) => [
                call.data?.get(BuiltInPolicyType.REALM_MATCH),
                call.data?.get<AnalysisBucketFile>(BuiltInPolicyType.ATTRIBUTES).path,
            ])).toEqual([[OWNER_REALM, 'main.py'], [OWNER_REALM, 'renamed.py']]);
        });

        it('should check the analysis realm, not the writer realm', async () => {
            const file = seedFile(AnalysisBucketType.CODE, { realmId: NODE_REALM });

            await expect(
                service.update(file.id, { path: 'x.py' }, createScopedActor({ realmId: NODE_REALM, realmScope: 'own' })),
            ).rejects.toThrow(PermissionError);
        });

        it('should deny an update without analysis_update', async () => {
            const file = seedFile(AnalysisBucketType.CODE);

            await expect(
                service.update(file.id, { path: 'x.py' }, createDenyAllActor(OWNER_REALM)),
            ).rejects.toThrow(PermissionError);
        });

        it('should reject a code file update once locked', async () => {
            const file = seedFile(AnalysisBucketType.CODE);
            analysis.configurationLocked = true;

            await expect(
                service.update(file.id, { path: 'x.py' }, createAllowAllActor()),
            ).rejects.toThrow(BadRequestError);
        });

        it('should reject root on a result file', async () => {
            const file = seedFile(AnalysisBucketType.RESULT);

            await expect(
                service.update(file.id, { root: true }, createAllowAllActor()),
            ).rejects.toThrow(BadRequestError);
        });

        it('should deny the owner realm a temp file update', async () => {
            const file = seedFile(AnalysisBucketType.TEMP);

            await expect(
                service.update(file.id, { path: 'x.py' }, createAllowAllActor(OWNER_REALM)),
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

            await service.delete(file.id, createAllowAllActor(OWNER_REALM));
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should deny a foreign realm', async () => {
            const file = seedFile(AnalysisBucketType.CODE, { realmId: NODE_REALM });

            await expect(
                service.delete(file.id, createScopedActor({ realmId: NODE_REALM, realmScope: 'own' })),
            ).rejects.toThrow(PermissionError);
        });

        it('should deny without analysis_update', async () => {
            const file = seedFile(AnalysisBucketType.RESULT);

            await expect(
                service.delete(file.id, createDenyAllActor(OWNER_REALM)),
            ).rejects.toThrow(PermissionError);
        });

        it('should reject a code file delete once locked', async () => {
            const file = seedFile(AnalysisBucketType.CODE);
            analysis.configurationLocked = true;

            await expect(
                service.delete(file.id, createAllowAllActor()),
            ).rejects.toThrow(BadRequestError);
        });

        it('should let the owner realm delete a result file after lock', async () => {
            const file = seedFile(AnalysisBucketType.RESULT);
            analysis.configurationLocked = true;

            await service.delete(file.id, createAllowAllActor(OWNER_REALM));
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should deny the owner realm a temp file delete', async () => {
            const file = seedFile(AnalysisBucketType.TEMP);

            await expect(
                service.delete(file.id, createAllowAllActor(OWNER_REALM)),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should deny a realm-scoped grant of the owner realm a temp file delete', async () => {
            const file = seedFile(AnalysisBucketType.TEMP);

            await expect(
                service.delete(file.id, createScopedActor({ realmId: OWNER_REALM, realmScope: 'own' })),
            ).rejects.toThrow(PermissionDeniedError);
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should let the system delete a temp file', async () => {
            const file = seedFile(AnalysisBucketType.TEMP);

            await service.delete(file.id, createSystemActor());
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

    describe('unregisterUpload', () => {
        it('should remove the file and flag a code file of a locked analysis', async () => {
            const file = seedFile(AnalysisBucketType.CODE);
            analysis.configurationLocked = true;

            const removal = await service.unregisterUpload(file.bucketId, file.bucketFileId);

            expect(removal?.frozen).toBe(true);
            expect(repository.getAll()).toHaveLength(0);
        });

        it.each([AnalysisBucketType.CODE, AnalysisBucketType.RESULT])('should not flag a %s file otherwise', async (type) => {
            const file = seedFile(type);
            analysis.configurationLocked = type === AnalysisBucketType.RESULT;

            const removal = await service.unregisterUpload(file.bucketId, file.bucketFileId);

            expect(removal?.frozen).toBe(false);
        });

        it('should recalculate when the root file is removed', async () => {
            const file = seedFile(AnalysisBucketType.CODE, { root: true });

            await service.unregisterUpload(file.bucketId, file.bucketFileId);

            expect(recalculator.getCalls()).toEqual([analysis.id]);
        });

        it('should not remove a file of another storage bucket with the same bucketFileId', async () => {
            const file = seedFile(AnalysisBucketType.CODE);

            await expect(service.unregisterUpload(randomUUID(), file.bucketFileId)).resolves.toBeNull();
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should answer null for an unknown file', async () => {
            await expect(service.unregisterUpload('unknown', 'unknown')).resolves.toBeNull();
        });
    });
    describe('read reach', () => {
        /** Compiles the result read to `allow` (any) and every other read to the actor's own realm. */
        class ResultAnyEvaluator extends FakePermissionEvaluator {
            async compile(ctx: Parameters<FakePermissionEvaluator['compile']>[0]): ReturnType<FakePermissionEvaluator['compile']> {
                this.compileCalls.push(ctx);
                const names = Array.isArray(ctx.name) ? ctx.name : [ctx.name];
                if (names.length === 1 && names[0] === PermissionName.ANALYSIS_RESULT_READ) {
                    return { verdict: 'allow' };
                }

                return { verdict: 'conditional', condition: eq('realmId', 'realm-stranger') };
            }
        }

        it('should not let a wider result read reach result files of analyses the actor cannot read', async () => {
            for (const type of Object.values(AnalysisBucketType)) seedFile(type);

            const actor = createAllowAllActor('realm-stranger');
            actor.permissionEvaluator = new ResultAnyEvaluator();

            const { data } = await service.getMany({ include: 'analysis' }, actor);
            expect(data).toHaveLength(0);
        });

        function nodeActor(holdsResultRead = true) {
            const actor = createAllowAllActor(NODE_REALM);
            if (!holdsResultRead) {
                actor.permissionEvaluator.setBehavior(({ method, ctx }) => {
                    const names = Array.isArray(ctx.name) ? ctx.name : [ctx.name];
                    if (method === 'preEvaluateOneOf' && names.length === 1 && names[0] === PermissionName.ANALYSIS_RESULT_READ) {
                        throw PermissionError.deniedAll(names);
                    }
                });
            }
            return actor;
        }

        async function listTypes(actor: ReturnType<typeof nodeActor>) {
            const { data } = await service.getMany({}, actor);
            return data.map((file) => file.analysisBucketId).map((id) => Object.values(buckets).find((b) => b.id === id).type).sort();
        }

        it('should show a pending node\'s realm the CODE files only', async () => {
            seedAnalysisNode(null);
            for (const type of Object.values(AnalysisBucketType)) seedFile(type);

            await expect(listTypes(nodeActor())).resolves.toEqual([AnalysisBucketType.CODE]);
        });

        it('should show an approved node\'s realm every file type when it holds the result read', async () => {
            seedAnalysisNode(AnalysisNodeApprovalStatus.APPROVED);
            for (const type of Object.values(AnalysisBucketType)) seedFile(type);

            await expect(listTypes(nodeActor())).resolves.toEqual([
                AnalysisBucketType.CODE,
                AnalysisBucketType.RESULT,
                AnalysisBucketType.TEMP,
            ].sort());
        });

        it('should leave out RESULT files without the result read, not refuse the listing', async () => {
            seedAnalysisNode(AnalysisNodeApprovalStatus.APPROVED);
            for (const type of Object.values(AnalysisBucketType)) seedFile(type);

            await expect(listTypes(nodeActor(false))).resolves.toEqual([
                AnalysisBucketType.CODE,
                AnalysisBucketType.TEMP,
            ].sort());
        });

        it('should answer a RESULT file without the result read like a missing one', async () => {
            seedAnalysisNode(AnalysisNodeApprovalStatus.APPROVED);
            const file = seedFile(AnalysisBucketType.RESULT);

            await expect(service.getOne(file.id, nodeActor(false))).rejects.toThrow(EntityNotFoundError);
        });

        it('should show nothing to a realm that neither owns nor takes part', async () => {
            for (const type of Object.values(AnalysisBucketType)) seedFile(type);

            const { data } = await service.getMany({}, createAllowAllActor('realm-stranger'));
            expect(data).toHaveLength(0);
        });

        it('should refuse an actor without any analysis read permission', async () => {
            await expect(service.getMany({}, createDenyAllActor())).rejects.toThrow(PermissionError);
        });
    });
});
