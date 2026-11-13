/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type {
    Analysis,
    AnalysisBucket,
    AnalysisBucketFile,
} from '@privateaim/core-kit';
import { AnalysisBucketType } from '@privateaim/core-kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import { FakeEntityRepository, createAllowAllActor, createScopedActor } from '@privateaim/server-test-kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisBucketAccess } from '../../../../src/core/services/analysis-bucket-access/index.ts';
import { AnalysisReachService } from '../../../../src/core/services/analysis-reach/index.ts';
import { StorageCapabilityService } from '../../../../src/core/services/storage-capability/index.ts';
import type { ICapabilityTokenIssuer } from '../../../../src/core/services/storage-capability/index.ts';
import { FakeAnalysisRepository } from '../entities/analysis/fake-repository.ts';
import { FakeAnalysisNodeRepository } from '../entities/analysis-node/fake-repository.ts';
import { FakeAnalysisBucketFileRepository } from '../entities/analysis-bucket-file/fake-repository.ts';
import { FakeNodeRepository } from '../entities/node/fake-repository.ts';

const OWNER_REALM = 'realm-owner';

class FakeCapabilityTokenIssuer implements ICapabilityTokenIssuer {
    calls: Parameters<ICapabilityTokenIssuer['issue']>[0][] = [];

    async issue(input: Parameters<ICapabilityTokenIssuer['issue']>[0]) {
        this.calls.push(input);

        return { token: 'fake', expiresIn: input.expiresIn };
    }
}

describe('StorageCapabilityService', () => {
    let issuer: FakeCapabilityTokenIssuer;
    let bucketRepository: FakeEntityRepository<AnalysisBucket>;
    let fileRepository: FakeAnalysisBucketFileRepository;
    let service: StorageCapabilityService;
    let analysis: Analysis;
    let otherAnalysis: Analysis;
    let codeBucket: AnalysisBucket;
    let resultBucket: AnalysisBucket;
    let foreignBucket: AnalysisBucket;

    beforeEach(() => {
        issuer = new FakeCapabilityTokenIssuer();

        const analysisRepository = new FakeAnalysisRepository();
        const analysisNodeRepository = new FakeAnalysisNodeRepository();

        bucketRepository = new FakeEntityRepository<AnalysisBucket>();
        fileRepository = new FakeAnalysisBucketFileRepository();

        analysis = {
            id: randomUUID(), 
            realmId: OWNER_REALM, 
            configurationLocked: false, 
        } as Analysis;
        otherAnalysis = {
            id: randomUUID(), 
            realmId: OWNER_REALM, 
            configurationLocked: false, 
        } as Analysis;
        analysisRepository.seed([analysis, otherAnalysis]);

        const bucket = (type: AnalysisBucketType, analysisId: string) => ({
            id: randomUUID(),
            type,
            bucketId: randomUUID(),
            analysisId,
            realmId: OWNER_REALM,
        } as AnalysisBucket);

        codeBucket = bucket(AnalysisBucketType.CODE, analysis.id);
        resultBucket = bucket(AnalysisBucketType.RESULT, analysis.id);
        foreignBucket = bucket(AnalysisBucketType.CODE, otherAnalysis.id);
        bucketRepository.seed([codeBucket, resultBucket, foreignBucket]);

        const reach = new AnalysisReachService({
            analysisNodeRepository,
            analysisRepository,
            nodeRepository: new FakeNodeRepository(),
        });

        service = new StorageCapabilityService({
            issuer,
            analysisBucketAccess: new AnalysisBucketAccess({
                reach, 
                analysisRepository, 
                analysisNodeRepository, 
            }),
            analysisRepository,
            analysisBucketRepository: bucketRepository,
            analysisBucketFileRepository: fileRepository,
        });
    });

    function seedFile(target: AnalysisBucket, analysisId: string) {
        const file = {
            id: randomUUID(),
            analysisId,
            analysisBucketId: target.id,
            bucketId: target.bucketId,
            bucketFileId: randomUUID(),
            realmId: OWNER_REALM,
        } as AnalysisBucketFile;

        fileRepository.seed(file);

        return file;
    }

    it('should issue the exact cap with the storage audience and default lifetime', async () => {
        const cap = [`bucket:${codeBucket.bucketId}:read,write,delete`];

        const result = await service.mint(analysis.id, { cap }, createAllowAllActor(OWNER_REALM), 'subject');

        expect(issuer.calls).toEqual([{
            subjectToken: 'subject',
            audience: 'storage',
            cap,
            expiresIn: 3600,
        }]);
        expect(result.token).toEqual('fake');
        expect(Date.parse(result.expiresAt)).toBeGreaterThan(Date.now());
    });

    it('should pass the requested lifetime on', async () => {
        await service.mint(
            analysis.id,
            { cap: [`bucket:${codeBucket.bucketId}:read`], lifetime: 60 },
            createAllowAllActor(OWNER_REALM),
            'subject',
        );

        expect(issuer.calls[0].expiresIn).toEqual(60);
    });

    it('should mint a bucket-file read entry', async () => {
        const file = seedFile(codeBucket, analysis.id);

        await service.mint(
            analysis.id,
            { cap: [`bucketFile:${file.bucketFileId}:read,delete`] },
            createAllowAllActor(OWNER_REALM),
            'subject',
        );

        expect(issuer.calls).toHaveLength(1);
    });

    it('should refuse a bucket of another analysis', async () => {
        await expect(service.mint(
            analysis.id,
            { cap: [`bucket:${foreignBucket.bucketId}:read`] },
            createAllowAllActor(OWNER_REALM),
            'subject',
        )).rejects.toBeInstanceOf(BadRequestError);

        expect(issuer.calls).toHaveLength(0);
    });

    it('should refuse a bucket-file of another analysis', async () => {
        const file = seedFile(foreignBucket, otherAnalysis.id);

        await expect(service.mint(
            analysis.id,
            { cap: [`bucketFile:${file.bucketFileId}:read`] },
            createAllowAllActor(OWNER_REALM),
            'subject',
        )).rejects.toBeInstanceOf(BadRequestError);

        expect(issuer.calls).toHaveLength(0);
    });

    it('should fail the whole mint when one entry is refused', async () => {
        await expect(service.mint(
            analysis.id,
            { cap: [`bucket:${codeBucket.bucketId}:read`, `bucket:${foreignBucket.bucketId}:read`] },
            createAllowAllActor(OWNER_REALM),
            'subject',
        )).rejects.toBeInstanceOf(BadRequestError);

        expect(issuer.calls).toHaveLength(0);
    });

    it('should refuse reading the result bucket to a non-participant', async () => {
        await expect(service.mint(
            analysis.id,
            { cap: [`bucket:${resultBucket.bucketId}:read`] },
            createScopedActor({ realmId: 'realm-stranger', realmScope: 'own' }),
            'subject',
        )).rejects.toBeInstanceOf(PermissionDeniedError);

        expect(issuer.calls).toHaveLength(0);
    });

    it('should refuse a bucket-file write entry', async () => {
        const file = seedFile(codeBucket, analysis.id);

        await expect(service.mint(
            analysis.id,
            { cap: [`bucketFile:${file.bucketFileId}:write`] },
            createAllowAllActor(OWNER_REALM),
            'subject',
        )).rejects.toBeInstanceOf(BadRequestError);
    });

    it('should refuse a malformed entry', async () => {
        await expect(service.mint(
            analysis.id,
            { cap: ['nonsense'] },
            createAllowAllActor(OWNER_REALM),
            'subject',
        )).rejects.toBeInstanceOf(BadRequestError);
    });

    it('should answer not found for a missing analysis', async () => {
        await expect(service.mint(
            randomUUID(),
            { cap: [`bucket:${codeBucket.bucketId}:read`] },
            createAllowAllActor(OWNER_REALM),
            'subject',
        )).rejects.toBeInstanceOf(EntityNotFoundError);
    });
});
