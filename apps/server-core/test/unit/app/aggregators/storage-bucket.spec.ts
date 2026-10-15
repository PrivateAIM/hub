/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import type { Analysis } from '@privateaim/core-kit';
import { AnalysisBucketType, DomainType, buildAnalysisBucketName } from '@privateaim/core-kit';
import type { BucketClearingFinishedEventPayload } from '@privateaim/server-storage-kit';
import type { Bucket } from '@privateaim/storage-kit';
import { BucketEvent } from '@privateaim/server-storage-kit';
import { LogFlag } from '@privateaim/telemetry-kit';
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
    ProjectEntity,
} from '../../../../src/adapters/database/index.ts';
import { StorageBucketAggregator } from '../../../../src/app/aggregators/storage/bucket/module.ts';
import {
    StorageBucketClearingFinishedHandler,
    StorageBucketCreationFailedHandler,
    StorageBucketCreationFinishedHandler,
    StorageBucketDeletionFinishedHandler,
} from '../../../../src/app/aggregators/storage/bucket/handlers/index.ts';
import type { StorageBucketAggregatorContext } from '../../../../src/app/aggregators/storage/bucket/types.ts';
import { DatabaseInjectionKey } from '../../../../src/app/modules/database/index.ts';
import { createTestDatabaseApplication } from '../../../app';
import { FakeBucketCaller } from '../../core/services/helpers/fake-bucket-caller.ts';
import { FakeLogger } from './fake-logger.ts';

function createPayload(bucket: AnalysisBucketEntity, fileIds: string[]): BucketClearingFinishedEventPayload {
    return {
        id: bucket.bucketId,
        name: bucket.bucketId,
        region: null,
        createdAt: bucket.createdAt,
        updatedAt: bucket.updatedAt,
        actorId: null,
        actorType: null,
        realmId: bucket.realmId,
        refType: null,
        refId: null,
        fileIds,
    };
}

describe('storage bucket aggregator', () => {
    const suite = createTestDatabaseApplication();
    let dataSource: DataSource;
    let ctx: StorageBucketAggregatorContext;
    let handler: StorageBucketClearingFinishedHandler;

    beforeAll(async () => {
        await suite.setup();
        dataSource = suite.container.resolve(DatabaseInjectionKey.DataSource);
        ctx = {
            analysisRepository: suite.container.resolve(DatabaseInjectionKey.AnalysisRepository),
            analysisBucketRepository: suite.container.resolve(DatabaseInjectionKey.AnalysisBucketRepository),
            analysisBucketFileRepository: suite.container.resolve(DatabaseInjectionKey.AnalysisBucketFileRepository),
            bucketCaller: new FakeBucketCaller(),
        };
        handler = new StorageBucketClearingFinishedHandler(ctx);
    });

    afterAll(async () => {
        await suite.teardown();
    });

    async function createAnalysis() {
        const projectRepository = dataSource.getRepository(ProjectEntity);
        const project = await projectRepository.save(projectRepository.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            realmId: faker.string.uuid(),
        }));
        const analysisRepository = dataSource.getRepository(AnalysisEntity);
        return analysisRepository.save(analysisRepository.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            realmId: project.realmId,
            projectId: project.id,
        }));
    }

    function createBucket(analysis: Pick<Analysis, 'id' | 'realmId'>, overrides: Partial<Bucket> = {}): Bucket {
        return {
            id: faker.string.uuid(),
            name: buildAnalysisBucketName(AnalysisBucketType.CODE, analysis.id),
            region: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            actorId: null,
            actorType: null,
            realmId: analysis.realmId,
            refType: DomainType.ANALYSIS,
            refId: analysis.id,
            ...overrides,
        };
    }

    async function createBucketWithFiles() {
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
        }));
        const bucketRepository = dataSource.getRepository(AnalysisBucketEntity);
        const bucket = await bucketRepository.save(bucketRepository.create({
            type: AnalysisBucketType.TEMP,
            bucketId: faker.string.uuid(),
            analysisId: analysis.id,
            realmId: analysis.realmId,
        }));

        const fileRepository = dataSource.getRepository(AnalysisBucketFileEntity);
        const files = await fileRepository.save([0, 1].map((index) => fileRepository.create({
            path: `file-${index}.txt`,
            bucketId: bucket.bucketId,
            bucketFileId: faker.string.uuid(),
            realmId: analysis.realmId,
            analysisId: analysis.id,
            analysisBucketId: bucket.id,
        })));

        return { bucket, files };
    }

    async function findFileIds(bucketId: string): Promise<string[]> {
        const entities = await dataSource.getRepository(AnalysisBucketFileEntity).findBy({ bucketId });
        return entities.map((entity) => entity.id).sort();
    }

    it('should remove only the files the clear removed', async () => {
        const { bucket, files } = await createBucketWithFiles();

        await handler.handle(createPayload(bucket, [files[0].bucketFileId]));

        expect(await findFileIds(bucket.bucketId)).toEqual([files[1].id]);
    });

    it('should remove nothing without file ids', async () => {
        const { bucket, files } = await createBucketWithFiles();

        await handler.handle(createPayload(bucket, []));

        expect(await findFileIds(bucket.bucketId)).toEqual(files.map((file) => file.id).sort());
    });

    it('should detach the analysis bucket on a deletion without task (storage HTTP delete)', async () => {
        const deleted = await createBucketWithFiles();
        const kept = await createBucketWithFiles();

        const deletionHandler = new StorageBucketDeletionFinishedHandler(ctx);
        const { fileIds, ...bucket } = createPayload(deleted.bucket, []);
        expect(fileIds).toEqual([]);

        await deletionHandler.handle(bucket);

        const repository = dataSource.getRepository(AnalysisBucketEntity);
        expect(await repository.findOneBy({ id: deleted.bucket.id })).toBeNull();
        expect(await repository.findOneBy({ id: kept.bucket.id })).not.toBeNull();
    });

    describe('creation finished', () => {
        function createHandler() {
            const bucketCaller = new FakeBucketCaller();
            const handler = new StorageBucketCreationFinishedHandler({ ...ctx, bucketCaller });
            return { bucketCaller, handler };
        }

        async function findAnalysisBuckets(analysisId: string) {
            return dataSource.getRepository(AnalysisBucketEntity).findBy({ analysisId });
        }

        it('should link the analysis bucket named by the reply', async () => {
            const analysis = await createAnalysis();
            const { bucketCaller, handler } = createHandler();
            const bucket = createBucket(analysis, { name: buildAnalysisBucketName(AnalysisBucketType.RESULT, analysis.id) });

            await handler.handle(bucket);

            const entities = await findAnalysisBuckets(analysis.id);
            expect(entities).toHaveLength(1);
            expect(entities[0]).toMatchObject({
                type: AnalysisBucketType.RESULT,
                bucketId: bucket.id,
                realmId: analysis.realmId,
            });
            expect(bucketCaller.getCallCount()).toBe(0);
        });

        it.each([
            ['a non-analysis ref type', (analysisId: string) => ({ refType: 'project', refId: analysisId })],
            ['no ref type', () => ({ refType: null, refId: null })],
            ['an unparseable name', () => ({ name: 'foo' })],
            ['a ref id other than the named analysis', () => ({ refId: faker.string.uuid() })],
            ['a realm other than the analysis', () => ({ realmId: faker.string.uuid() })],
        ])('should ignore a reply with %s', async (_label, overrides) => {
            const analysis = await createAnalysis();
            const { bucketCaller, handler } = createHandler();

            await handler.handle(createBucket(analysis, overrides(analysis.id)));

            expect(await findAnalysisBuckets(analysis.id)).toHaveLength(0);
            expect(bucketCaller.getCallCount()).toBe(0);
        });

        it('should delete a duplicate storage bucket and keep the linked one', async () => {
            const analysis = await createAnalysis();
            const { bucketCaller, handler } = createHandler();
            const linked = createBucket(analysis);
            const orphan = createBucket(analysis);

            await handler.handle(linked);
            await handler.handle(orphan);

            const entities = await findAnalysisBuckets(analysis.id);
            expect(entities).toHaveLength(1);
            expect(entities[0].bucketId).toEqual(linked.id);
            expect(bucketCaller.getCalls()).toEqual([{ method: 'callDelete', data: { id: orphan.id } }]);
        });

        it('should not delete the linked bucket on a repeated reply', async () => {
            const analysis = await createAnalysis();
            const { bucketCaller, handler } = createHandler();
            const linked = createBucket(analysis);

            await handler.handle(linked);
            await handler.handle(linked);

            expect(await findAnalysisBuckets(analysis.id)).toHaveLength(1);
            expect(bucketCaller.getCallCount()).toBe(0);
        });
    });

    describe('creation failed', () => {
        it('should log the failure against the named analysis', async () => {
            const logger = new FakeLogger();
            const handler = new StorageBucketCreationFailedHandler({ ...ctx, logger });
            const analysisId = faker.string.uuid();

            await handler.handle({
                id: undefined,
                error: new Error('disk full'),
                refType: DomainType.ANALYSIS,
                refId: analysisId,
                name: buildAnalysisBucketName(AnalysisBucketType.TEMP, analysisId),
            });

            expect(logger.entries).toHaveLength(1);
            expect(logger.entries[0].level).toEqual('error');
            expect(logger.entries[0].message).toContain('disk full');
            expect(logger.entries[0].meta).toMatchObject({
                [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
                [LogFlag.REF_ID]: analysisId,
                bucketType: AnalysisBucketType.TEMP,
            });
        });

        it('should log the failure without refs when the payload names no analysis', async () => {
            const logger = new FakeLogger();
            // through the aggregator: pins the CREATION_FAILED mount
            const aggregator = new StorageBucketAggregator({ ...ctx, logger });

            await aggregator.handle(BucketEvent.CREATION_FAILED, { id: undefined, error: new Error('disk full') });

            expect(logger.entries).toHaveLength(1);
            expect(logger.entries[0].level).toEqual('error');
            expect(logger.entries[0].message).toContain('disk full');
            expect(logger.entries[0].meta[LogFlag.REF_TYPE]).toBeUndefined();
            expect(logger.entries[0].meta[LogFlag.REF_ID]).toBeUndefined();
        });
    });
});
