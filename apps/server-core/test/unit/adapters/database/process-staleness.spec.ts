/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import { ProcessStatus } from '@privateaim/kit';
import type {
    AnalysisBuilderCheckFinishedPayload,
    AnalysisDistributorExecutionProgressPayload,
} from '@privateaim/server-core-worker-kit';
import {
    AnalysisBuilderEvent,
    AnalysisDistributorEvent,
} from '@privateaim/server-core-worker-kit';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import type { DataSource } from 'typeorm';
import { AnalysisEntity, ProjectEntity } from '../../../../src/adapters/database/index.ts';
import { AnalysisInjectionKey } from '../../../../src/app/modules/analysis/index.ts';
import { DatabaseInjectionKey } from '../../../../src/app/modules/database/index.ts';
import type { IAnalysisRepository } from '../../../../src/core/index.ts';
import type { AnalysisBuilder, AnalysisDistributor } from '../../../../src/core/services/index.ts';
import { ANALYSIS_PROCESS_STALE_THRESHOLD_MS } from '../../../../src/core/services/helpers.ts';
import { createTestDatabaseApplication } from '../../../app';

/**
 * The stale verdict (F13) and the reconciler query (F14) both read
 * `updated_at`, which sits behind a transformer and is stamped by typeorm —
 * so these cases run against a real database rather than the fake repository.
 */
describe('process staleness', () => {
    const suite = createTestDatabaseApplication();
    let dataSource: DataSource;
    let repository: IAnalysisRepository;
    let builder: AnalysisBuilder;
    let distributor: AnalysisDistributor;

    beforeAll(async () => {
        await suite.setup();
        dataSource = suite.container.resolve(DatabaseInjectionKey.DataSource);
        repository = suite.container.resolve(DatabaseInjectionKey.AnalysisRepository);
        builder = suite.container.resolve(AnalysisInjectionKey.Builder);
        distributor = suite.container.resolve(AnalysisInjectionKey.Distributor);
    });

    afterAll(async () => {
        await suite.teardown();
    });

    const STALE_AGE_MS = ANALYSIS_PROCESS_STALE_THRESHOLD_MS + 60_000;

    async function createAnalysis(overrides: Partial<AnalysisEntity> = {}, ageMs = 0): Promise<AnalysisEntity> {
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
            ...overrides,
        }));

        if (ageMs > 0) {
            // an explicit value wins over the UpdateDateColumn's CURRENT_TIMESTAMP
            await analysisRepository.update({ id: analysis.id }, { updatedAt: new Date(Date.now() - ageMs).toISOString() });
        }

        return analysisRepository.findOneByOrFail({ id: analysis.id });
    }

    it('should stamp updated_at on a progress event that does not change the percent', async () => {
        const analysis = await createAnalysis({
            buildStatus: ProcessStatus.EXECUTED,
            distributionStatus: ProcessStatus.STARTED,
            distributionProgress: 40,
        }, STALE_AGE_MS);

        const payload: AnalysisDistributorExecutionProgressPayload = {
            id: analysis.id,
            progress: {
                current: 0,
                total: 0,
                percent: 40,
            },
        };
        await distributor.applyEvent(AnalysisDistributorEvent.EXECUTION_PROGRESS, payload);

        const entity = await dataSource.getRepository(AnalysisEntity).findOneByOrFail({ id: analysis.id });
        expect(entity.distributionProgress).toBe(40);
        expect(Date.parse(entity.updatedAt)).toBeGreaterThan(Date.now() - 60_000);
    });

    it('should FAIL a stale in-progress build on an in-progress check verdict', async () => {
        const analysis = await createAnalysis({
            configurationLocked: true,
            buildStatus: ProcessStatus.STARTED,
        }, STALE_AGE_MS);

        const payload: AnalysisBuilderCheckFinishedPayload = {
            id: analysis.id,
            status: ProcessStatus.STARTED,
            checkedAt: analysis.updatedAt,
        };
        await builder.applyEvent(AnalysisBuilderEvent.CHECK_FINISHED, payload);

        const entity = await dataSource.getRepository(AnalysisEntity).findOneByOrFail({ id: analysis.id });
        expect(entity.buildStatus).toBe(ProcessStatus.FAILED);
    });

    it('should keep a fresh in-progress build on an in-progress check verdict', async () => {
        const analysis = await createAnalysis({
            configurationLocked: true,
            buildStatus: ProcessStatus.STARTED,
        });

        const payload: AnalysisBuilderCheckFinishedPayload = {
            id: analysis.id,
            status: ProcessStatus.STARTED,
            checkedAt: analysis.updatedAt,
        };
        await builder.applyEvent(AnalysisBuilderEvent.CHECK_FINISHED, payload);

        const entity = await dataSource.getRepository(AnalysisEntity).findOneByOrFail({ id: analysis.id });
        expect(entity.buildStatus).toBe(ProcessStatus.STARTED);
    });

    it('should find only in-progress analyses last written before the cut-off', async () => {
        const staleBuild = await createAnalysis({ buildStatus: ProcessStatus.STARTING }, STALE_AGE_MS);
        const staleDistribution = await createAnalysis({
            buildStatus: ProcessStatus.EXECUTED,
            distributionStatus: ProcessStatus.STARTED,
        }, STALE_AGE_MS);
        const freshBuild = await createAnalysis({ buildStatus: ProcessStatus.STARTED });
        const staleExecuted = await createAnalysis({
            buildStatus: ProcessStatus.EXECUTED,
            distributionStatus: ProcessStatus.EXECUTED,
        }, STALE_AGE_MS);

        const found = await repository.findManyInProgressUpdatedBefore(
            new Date(Date.now() - ANALYSIS_PROCESS_STALE_THRESHOLD_MS),
        );
        const ids = found.map((entity) => entity.id);

        expect(ids).toContain(staleBuild.id);
        expect(ids).toContain(staleDistribution.id);
        expect(ids).not.toContain(freshBuild.id);
        expect(ids).not.toContain(staleExecuted.id);
    });
});
