/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import { AnalysisBucketType } from '@privateaim/core-kit';
import type { BucketClearingFinishedEventPayload } from '@privateaim/server-storage-kit';
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
import { StorageBucketClearingFinishedHandler } from '../../../../src/app/aggregators/storage/bucket/handlers/clearing_finished.ts';
import { ComponentsInjectionKey } from '../../../../src/app/modules/components/index.ts';
import { DatabaseInjectionKey } from '../../../../src/app/modules/database/index.ts';
import { createTestDatabaseApplication } from '../../../app';

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
    let handler: StorageBucketClearingFinishedHandler;

    beforeAll(async () => {
        await suite.setup();
        dataSource = suite.container.resolve(DatabaseInjectionKey.DataSource);
        handler = new StorageBucketClearingFinishedHandler({
            dataSource,
            taskManager: suite.container.resolve(ComponentsInjectionKey.TaskManager),
        });
    });

    afterAll(async () => {
        await suite.teardown();
    });

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
});
