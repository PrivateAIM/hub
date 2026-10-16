/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import { AnalysisBucketType, AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import type { BucketFileDeleteCommandPayload } from '@privateaim/server-storage-kit';
import { BucketFileTaskDispatcher } from '@privateaim/server-storage-kit';
import type { BucketFile } from '@privateaim/storage-kit';
import { FakeMessageBus } from '@hubwire/test';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import type { DataSource } from 'typeorm';
import {
    AnalysisBucketEntity,
    AnalysisBucketFileEntity,
    AnalysisEntity,
    AnalysisNodeEntity,
    NodeEntity,
    ProjectEntity,
} from '../../../../src/adapters/database/index.ts';
import { StorageBucketFileCreationFinishedHandler } from '../../../../src/app/aggregators/storage/bucket-file/handlers/creation_finished.ts';
import { AnalysisBucketFileService } from '../../../../src/core/index.ts';
import { AnalysisReachService } from '../../../../src/core/services/analysis-reach/index.ts';
import { DatabaseInjectionKey } from '../../../../src/app/modules/database/index.ts';
import { createTestDatabaseApplication } from '../../../app';
import { FakeAnalysisFileMetadataRecalculator } from '../../core/entities/analysis-bucket-file/fake-metadata-recalculator.ts';

class FakeBucketFileDispatcher extends BucketFileTaskDispatcher {
    deleted: BucketFileDeleteCommandPayload[] = [];

    constructor() {
        // dispatchDelete is overridden, so nothing reaches this bus
        super({ messageBus: new FakeMessageBus() });
    }

    override async dispatchDelete(payload: BucketFileDeleteCommandPayload) {
        this.deleted.push(payload);
    }
}

describe('storage bucket-file aggregator', () => {
    const suite = createTestDatabaseApplication();
    let dataSource: DataSource;
    let handler: StorageBucketFileCreationFinishedHandler;
    let bucketFileDispatcher: FakeBucketFileDispatcher;

    beforeAll(async () => {
        await suite.setup();
        dataSource = suite.container.resolve(DatabaseInjectionKey.DataSource);
        bucketFileDispatcher = new FakeBucketFileDispatcher();
        const analysisRepository = suite.container.resolve(DatabaseInjectionKey.AnalysisRepository);
        handler = new StorageBucketFileCreationFinishedHandler({
            service: new AnalysisBucketFileService({
                repository: suite.container.resolve(DatabaseInjectionKey.AnalysisBucketFileRepository),
                recalculator: new FakeAnalysisFileMetadataRecalculator(analysisRepository),
                analysisRepository,
                analysisBucketRepository: suite.container.resolve(DatabaseInjectionKey.AnalysisBucketRepository),
                analysisNodeRepository: suite.container.resolve(DatabaseInjectionKey.AnalysisNodeRepository),
                reach: new AnalysisReachService({
                    analysisNodeRepository: suite.container.resolve(DatabaseInjectionKey.AnalysisNodeRepository),
                    analysisRepository,
                    nodeRepository: suite.container.resolve(DatabaseInjectionKey.NodeRepository),
                }),
            }),
            bucketFileDispatcher,
        });
    });

    afterAll(async () => {
        await suite.teardown();
    });

    async function createBucket(type: AnalysisBucketType, configurationLocked: boolean) {
        const projectRepository = dataSource.getRepository(ProjectEntity);
        const project = await projectRepository.save(projectRepository.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            realmId: faker.string.uuid(),
        }));
        const analysisRepository = dataSource.getRepository(AnalysisEntity);
        const analysis = await analysisRepository.save(analysisRepository.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            realmId: project.realmId,
            projectId: project.id,
            configurationLocked,
        }));
        const bucketRepository = dataSource.getRepository(AnalysisBucketEntity);
        return bucketRepository.save(bucketRepository.create({
            type,
            bucketId: faker.string.uuid(),
            analysisId: analysis.id,
            realmId: analysis.realmId,
        }));
    }

    async function seedAnalysisNode(bucket: AnalysisBucketEntity, nodeRealmId: string, approvalStatus: AnalysisNodeApprovalStatus | null) {
        const nodeRepository = dataSource.getRepository(NodeEntity);
        const node = await nodeRepository.save(nodeRepository.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            realmId: nodeRealmId,
        }));
        const analysisNodeRepository = dataSource.getRepository(AnalysisNodeEntity);
        await analysisNodeRepository.save(analysisNodeRepository.create({
            analysisId: bucket.analysisId,
            analysisRealmId: bucket.realmId,
            nodeId: node.id,
            nodeRealmId,
            approvalStatus,
        }));
    }

    function createPayload(bucket: AnalysisBucketEntity, actorType: string, realmId = bucket.realmId): BucketFile {
        return {
            id: faker.string.uuid(),
            name: 'main.py',
            path: 'main.py',
            hash: 'hash',
            directory: '',
            size: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            actorId: faker.string.uuid(),
            actorType,
            realmId,
            bucketId: bucket.bucketId,
            bucket: undefined,
        };
    }

    function findFiles(bucketId: string) {
        return dataSource.getRepository(AnalysisBucketFileEntity).findBy({ bucketId });
    }

    it('should register a code file from the owner realm while unlocked', async () => {
        const bucket = await createBucket(AnalysisBucketType.CODE, false);
        const payload = createPayload(bucket, 'user');

        await handler.handle(payload);

        const files = await findFiles(bucket.bucketId);
        expect(files).toHaveLength(1);
        expect(files[0].userId).toBe(payload.actorId);
        expect(files[0].realmId).toBe(bucket.realmId);
    });

    it('should reject and delete a code file once locked', async () => {
        const bucket = await createBucket(AnalysisBucketType.CODE, true);
        const payload = createPayload(bucket, 'user');

        await handler.handle(payload);

        expect(await findFiles(bucket.bucketId)).toHaveLength(0);
        expect(bucketFileDispatcher.deleted).toContainEqual({ id: payload.id });
    });

    it('should reject and delete a code file from a foreign realm', async () => {
        const bucket = await createBucket(AnalysisBucketType.CODE, false);
        const payload = createPayload(bucket, 'user', faker.string.uuid());

        await handler.handle(payload);

        expect(await findFiles(bucket.bucketId)).toHaveLength(0);
        expect(bucketFileDispatcher.deleted).toContainEqual({ id: payload.id });
    });

    it('should register a result file from an approved node realm and map a client uploader', async () => {
        const bucket = await createBucket(AnalysisBucketType.RESULT, true);
        const nodeRealmId = faker.string.uuid();
        await seedAnalysisNode(bucket, nodeRealmId, AnalysisNodeApprovalStatus.APPROVED);
        const payload = createPayload(bucket, 'client', nodeRealmId);

        await handler.handle(payload);

        const files = await findFiles(bucket.bucketId);
        expect(files).toHaveLength(1);
        expect(files[0].clientId).toBe(payload.actorId);
        expect(files[0].userId).toBeNull();
    });

    it.each([AnalysisBucketType.RESULT, AnalysisBucketType.TEMP])('should not register, but keep, a %s file from a non-participant realm', async (type) => {
        const bucket = await createBucket(type, true);
        const nodeRealmId = faker.string.uuid();
        await seedAnalysisNode(bucket, nodeRealmId, null);
        const payload = createPayload(bucket, 'client', nodeRealmId);

        await handler.handle(payload);

        expect(await findFiles(bucket.bucketId)).toHaveLength(0);
        expect(bucketFileDispatcher.deleted).not.toContainEqual({ id: payload.id });
    });

    it('should not match any approved node when the uploader has no realm', async () => {
        const bucket = await createBucket(AnalysisBucketType.RESULT, true);
        await seedAnalysisNode(bucket, faker.string.uuid(), AnalysisNodeApprovalStatus.APPROVED);
        const payload = createPayload(bucket, 'client', undefined);
        payload.realmId = undefined;

        await handler.handle(payload);

        expect(await findFiles(bucket.bucketId)).toHaveLength(0);
    });

    it('should register a result file from the analysis client', async () => {
        const bucket = await createBucket(AnalysisBucketType.RESULT, true);
        const payload = createPayload(bucket, 'client');
        await dataSource.getRepository(AnalysisEntity).update({ id: bucket.analysisId }, { clientId: payload.actorId });

        await handler.handle(payload);

        expect(await findFiles(bucket.bucketId)).toHaveLength(1);
    });
});
