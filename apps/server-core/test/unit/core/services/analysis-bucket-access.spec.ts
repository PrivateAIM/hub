/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { PermissionError } from '@authup/access';
import type {
    Analysis,
    AnalysisBucket,
    AnalysisNode,
} from '@privateaim/core-kit';
import { AnalysisBucketType, AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { BadRequestError, PermissionDeniedError } from '@privateaim/errors';
import { PermissionName } from '@privateaim/kit';
import {
    createAllowAllActor,
    createScopedActor,
} from '@privateaim/server-test-kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisBucketAccess } from '../../../../src/core/services/analysis-bucket-access/index.ts';
import { AnalysisReachService } from '../../../../src/core/services/analysis-reach/index.ts';
import { FakeAnalysisRepository } from '../entities/analysis/fake-repository.ts';
import { FakeAnalysisNodeRepository } from '../entities/analysis-node/fake-repository.ts';
import { FakeNodeRepository } from '../entities/node/fake-repository.ts';

const OWNER_REALM = 'realm-owner';
const NODE_REALM = 'realm-node';

describe('AnalysisBucketAccess', () => {
    let analysisRepository: FakeAnalysisRepository;
    let analysisNodeRepository: FakeAnalysisNodeRepository;
    let access: AnalysisBucketAccess;
    let analysis: Analysis;
    let buckets: Record<AnalysisBucketType, AnalysisBucket>;

    beforeEach(() => {
        analysisRepository = new FakeAnalysisRepository();
        analysisNodeRepository = new FakeAnalysisNodeRepository();

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
        }

        access = new AnalysisBucketAccess({
            reach: new AnalysisReachService({
                analysisNodeRepository,
                analysisRepository,
                nodeRepository: new FakeNodeRepository(),
            }),
            analysisRepository,
            analysisNodeRepository,
        });
    });

    function seedAnalysisNode(approvalStatus: AnalysisNodeApprovalStatus | null) {
        analysisNodeRepository.seed({
            id: randomUUID(),
            analysisId: analysis.id,
            nodeRealmId: NODE_REALM,
            analysisRealmId: OWNER_REALM,
            approvalStatus,
        } as AnalysisNode);
    }

    function createNodeActor(holdsResultRead = true) {
        const actor = createScopedActor({ realmId: NODE_REALM, realmScope: 'own' });

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

    describe('canRead', () => {
        it('should let a pending participant read the code bucket', async () => {
            seedAnalysisNode(null);

            await expect(access.canRead(createNodeActor(), buckets[AnalysisBucketType.CODE])).resolves.toBe(true);
        });

        it('should refuse the code bucket to a non-participant', async () => {
            await expect(access.canRead(createNodeActor(), buckets[AnalysisBucketType.CODE])).resolves.toBe(false);
        });

        it('should refuse the temp bucket while the node is not approved', async () => {
            seedAnalysisNode(null);

            await expect(access.canRead(createNodeActor(), buckets[AnalysisBucketType.TEMP])).resolves.toBe(false);
        });

        it('should let an approved node read the temp bucket', async () => {
            seedAnalysisNode(AnalysisNodeApprovalStatus.APPROVED);

            await expect(access.canRead(createNodeActor(), buckets[AnalysisBucketType.TEMP])).resolves.toBe(true);
        });

        it('should refuse the result bucket without analysis_result_read', async () => {
            seedAnalysisNode(AnalysisNodeApprovalStatus.APPROVED);

            await expect(
                access.canRead(createNodeActor(false), buckets[AnalysisBucketType.RESULT]),
            ).resolves.toBe(false);
        });

        it('should let an approved node with analysis_result_read read the result bucket', async () => {
            seedAnalysisNode(AnalysisNodeApprovalStatus.APPROVED);

            await expect(access.canRead(createNodeActor(), buckets[AnalysisBucketType.RESULT])).resolves.toBe(true);
        });
    });

    describe('assertWrite', () => {
        it('should deny a result upload from a non-participant realm', async () => {
            await expect(
                access.assertWrite(createNodeActor(), buckets[AnalysisBucketType.RESULT], analysis),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should accept a result upload from an approved node realm', async () => {
            seedAnalysisNode(AnalysisNodeApprovalStatus.APPROVED);

            await expect(
                access.assertWrite(createNodeActor(), buckets[AnalysisBucketType.RESULT], analysis),
            ).resolves.toBeUndefined();
        });

        it('should reject a code write once the analysis is locked', async () => {
            analysis.configurationLocked = true;

            await expect(
                access.assertWrite(createAllowAllActor(OWNER_REALM), buckets[AnalysisBucketType.CODE], analysis),
            ).rejects.toThrow(BadRequestError);
        });
    });

    describe('assertDelete', () => {
        it('should deny a temp delete unless the actor is the system', async () => {
            await expect(
                access.assertDelete(createAllowAllActor(OWNER_REALM), buckets[AnalysisBucketType.TEMP], analysis),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should let the system delete from the temp bucket', async () => {
            await expect(
                access.assertDelete(
                    createScopedActor({ realmId: 'realm-master', realmScope: 'any' }),
                    buckets[AnalysisBucketType.TEMP],
                    analysis,
                ),
            ).resolves.toBeUndefined();
        });
    });
});
