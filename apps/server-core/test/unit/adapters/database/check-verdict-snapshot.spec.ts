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
    AnalysisDistributorCheckFinishedPayload,
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
import type { AnalysisBuilder, AnalysisDistributor } from '../../../../src/core/services/index.ts';
import { createTestDatabaseApplication } from '../../../app';

/**
 * A CHECK_FINISHED verdict is compared against the row's `updatedAt` as the
 * database stores it (mysql may truncate fractional seconds), so these cases
 * run against a real database rather than the fake repository.
 */
describe('check verdict snapshot', () => {
    const suite = createTestDatabaseApplication();
    let dataSource: DataSource;
    let builder: AnalysisBuilder;
    let distributor: AnalysisDistributor;

    beforeAll(async () => {
        await suite.setup();
        dataSource = suite.container.resolve(DatabaseInjectionKey.DataSource);
        builder = suite.container.resolve(AnalysisInjectionKey.Builder);
        distributor = suite.container.resolve(AnalysisInjectionKey.Distributor);
    });

    afterAll(async () => {
        await suite.teardown();
    });

    async function createAnalysis(overrides: Partial<AnalysisEntity> = {}): Promise<AnalysisEntity> {
        const projectRepository = dataSource.getRepository(ProjectEntity);
        const project = await projectRepository.save(projectRepository.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            realmId: faker.string.uuid(),
        }));

        const repository = dataSource.getRepository(AnalysisEntity);

        return repository.save(repository.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            realmId: project.realmId,
            projectId: project.id,
            ...overrides,
        }));
    }

    async function findAnalysis(id: string): Promise<AnalysisEntity> {
        return dataSource.getRepository(AnalysisEntity).findOneByOrFail({ id });
    }

    function before(updatedAt: string): string {
        return new Date(Date.parse(updatedAt) - 60_000).toISOString();
    }

    describe('analysis-builder', () => {
        it('should ignore a CHECK_FINISHED verdict about an older snapshot', async () => {
            // the check read the row while it was STARTED; a rebuild has since moved it on
            const analysis = await findAnalysis((await createAnalysis({ buildStatus: ProcessStatus.STARTING })).id);

            const payload: AnalysisBuilderCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.FAILED,
                checkedAt: before(analysis.updatedAt),
            };

            await builder.applyEvent(AnalysisBuilderEvent.CHECK_FINISHED, payload);

            const entity = await findAnalysis(analysis.id);

            expect(entity.buildStatus).toBe(ProcessStatus.STARTING);
        });

        it('should apply a CHECK_FINISHED verdict about the current snapshot', async () => {
            const analysis = await findAnalysis((await createAnalysis({ buildStatus: ProcessStatus.STARTING })).id);

            const payload: AnalysisBuilderCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.FAILED,
                checkedAt: analysis.updatedAt,
            };

            await builder.applyEvent(AnalysisBuilderEvent.CHECK_FINISHED, payload);

            const entity = await findAnalysis(analysis.id);

            expect(entity.buildStatus).toBe(ProcessStatus.FAILED);
        });
    });

    describe('analysis-distributor', () => {
        it('should ignore a CHECK_FINISHED verdict about an older snapshot', async () => {
            const analysis = await findAnalysis((await createAnalysis({
                buildStatus: ProcessStatus.EXECUTED,
                distributionStatus: ProcessStatus.STARTING,
            })).id);

            const payload: AnalysisDistributorCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.FAILED,
                checkedAt: before(analysis.updatedAt),
            };

            await distributor.applyEvent(AnalysisDistributorEvent.CHECK_FINISHED, payload);

            const entity = await findAnalysis(analysis.id);

            expect(entity.distributionStatus).toBe(ProcessStatus.STARTING);
        });

        it('should apply a CHECK_FINISHED verdict about the current snapshot', async () => {
            const analysis = await findAnalysis((await createAnalysis({
                buildStatus: ProcessStatus.EXECUTED,
                distributionStatus: ProcessStatus.STARTING,
            })).id);

            const payload: AnalysisDistributorCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.FAILED,
                checkedAt: analysis.updatedAt,
            };

            await distributor.applyEvent(AnalysisDistributorEvent.CHECK_FINISHED, payload);

            const entity = await findAnalysis(analysis.id);

            expect(entity.distributionStatus).toBe(ProcessStatus.FAILED);
        });
    });
});
