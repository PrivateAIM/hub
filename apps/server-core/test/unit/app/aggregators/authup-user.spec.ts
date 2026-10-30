/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import type { EventRecord, User } from '@authup/core-kit';
import { EntityType } from '@authup/core-kit';
import { AnalysisBucketType } from '@privateaim/core-kit';
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
import { handleAuthupUserEvent } from '../../../../src/app/aggregators/authup/entities/user.ts';
import type { AuthupAggregatorRepositories } from '../../../../src/app/aggregators/authup/types.ts';
import { DatabaseInjectionKey } from '../../../../src/app/modules/database/index.ts';
import { createTestDatabaseApplication } from '../../../app';

function createDeletedEvent(userId: string): EventRecord<EntityType.USER, Pick<User, 'id'>> {
    return {
        type: EntityType.USER,
        event: 'deleted',
        data: { id: userId },
    };
}

describe('authup user aggregator', () => {
    const suite = createTestDatabaseApplication();
    let dataSource: DataSource;
    let repositories: AuthupAggregatorRepositories;

    beforeAll(async () => {
        await suite.setup();
        dataSource = suite.container.resolve(DatabaseInjectionKey.DataSource);
        repositories = {
            analysisRepository: suite.container.resolve(DatabaseInjectionKey.AnalysisRepository),
            analysisBucketFileRepository: suite.container.resolve(DatabaseInjectionKey.AnalysisBucketFileRepository),
            nodeRepository: suite.container.resolve(DatabaseInjectionKey.NodeRepository),
            projectRepository: suite.container.resolve(DatabaseInjectionKey.ProjectRepository),
            registryProjectRepository: suite.container.resolve(DatabaseInjectionKey.RegistryProjectRepository),
        };
    });

    afterAll(async () => {
        await suite.teardown();
    });

    async function createOwnedAnalysis(userId: string) {
        const projectRepository = dataSource.getRepository(ProjectEntity);
        const project = await projectRepository.save(projectRepository.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            realmId: faker.string.uuid(),
            userId,
        }));
        const analysisRepository = dataSource.getRepository(AnalysisEntity);
        const analysis = await analysisRepository.save(analysisRepository.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            realmId: project.realmId,
            projectId: project.id,
            userId,
        }));
        const bucketRepository = dataSource.getRepository(AnalysisBucketEntity);
        const bucket = await bucketRepository.save(bucketRepository.create({
            type: AnalysisBucketType.CODE,
            bucketId: faker.string.uuid(),
            analysisId: analysis.id,
            realmId: analysis.realmId,
        }));
        const fileRepository = dataSource.getRepository(AnalysisBucketFileEntity);
        const file = await fileRepository.save(fileRepository.create({
            path: 'main.py',
            bucketId: bucket.bucketId,
            bucketFileId: faker.string.uuid(),
            realmId: analysis.realmId,
            analysisId: analysis.id,
            analysisBucketId: bucket.id,
            userId,
        }));

        return {
            project,
            analysis,
            file,
        };
    }

    it('should detach a deleted user from projects, analyses and bucket files', async () => {
        const userId = faker.string.uuid();
        const {
            project,
            analysis,
            file,
        } = await createOwnedAnalysis(userId);

        await handleAuthupUserEvent(createDeletedEvent(userId), repositories);

        const projectAfter = await dataSource.getRepository(ProjectEntity).findOneBy({ id: project.id });

        expect(projectAfter?.userId).toBeNull();

        const analysisAfter = await dataSource.getRepository(AnalysisEntity).findOneBy({ id: analysis.id });

        expect(analysisAfter?.userId).toBeNull();

        // the file belongs to an analysis that outlives its uploader, so it is
        // detached, never removed.
        const fileAfter = await dataSource.getRepository(AnalysisBucketFileEntity).findOneBy({ id: file.id });

        expect(fileAfter).not.toBeNull();
        expect(fileAfter?.userId).toBeNull();
    });

    it('should leave other users untouched', async () => {
        const userId = faker.string.uuid();
        const { analysis, file } = await createOwnedAnalysis(userId);

        await handleAuthupUserEvent(createDeletedEvent(faker.string.uuid()), repositories);

        const analysisAfter = await dataSource.getRepository(AnalysisEntity).findOneBy({ id: analysis.id });

        expect(analysisAfter?.userId).toEqual(userId);

        const fileAfter = await dataSource.getRepository(AnalysisBucketFileEntity).findOneBy({ id: file.id });

        expect(fileAfter?.userId).toEqual(userId);
    });
});
