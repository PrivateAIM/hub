/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import { AnalysisBuilderCommandChecker } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type {
    AnalysisBuilderCheckFinishedPayload,
    AnalysisBuilderEventMap,
    AnalysisDistributorCheckFinishedPayload,
    AnalysisDistributorEventMap,
} from '@privateaim/server-core-worker-kit';
import {
    AnalysisBuilderEvent,
    AnalysisDistributorEvent,
} from '@privateaim/server-core-worker-kit';
import type { ComponentEventMap, ComponentHandlerContext } from '@privateaim/server-kit';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import type { DataSource } from 'typeorm';
import { AnalysisEntity, ProjectEntity } from '../../../../src/adapters/database/index.ts';
import { DatabaseInjectionKey } from '../../../../src/app/modules/database/index.ts';
import { handleAnalysisBuilderEvent } from '../../../../src/app/aggregators/worker/analysis-builder/handler.ts';
import { handleAnalysisDistributorEvent } from '../../../../src/app/aggregators/worker/analysis-distributor/handler.ts';
import { createTestDatabaseApplication } from '../../../app';

function createContext<
    EventMap extends ComponentEventMap,
>(key: keyof EventMap & string): ComponentHandlerContext<EventMap> {
    return {
        key,
        metadata: {},
        handle: async () => {},
    };
}

describe('worker analysis aggregators', () => {
    const suite = createTestDatabaseApplication();
    let dataSource: DataSource;

    beforeAll(async () => {
        await suite.setup();
        dataSource = suite.container.resolve(DatabaseInjectionKey.DataSource);
    });

    afterAll(async () => {
        await suite.teardown();
    });

    async function createAnalysis(overrides: Partial<AnalysisEntity> = {}): Promise<AnalysisEntity> {
        const projectRepository = dataSource.getRepository(ProjectEntity);
        const project = await projectRepository.save(projectRepository.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            realm_id: faker.string.uuid(),
        }));

        const repository = dataSource.getRepository(AnalysisEntity);
        return repository.save(repository.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            realm_id: project.realm_id,
            project_id: project.id,
            ...overrides,
        }));
    }

    async function findAnalysis(id: string): Promise<AnalysisEntity> {
        return dataSource.getRepository(AnalysisEntity).findOneByOrFail({ id });
    }

    describe('analysis-builder', () => {
        it('should apply build metadata on CHECK_FINISHED with status EXECUTED', async () => {
            const analysis = await createAnalysis({
                build_status: ProcessStatus.STARTED,
                build_progress: 40,
            });

            const payload: AnalysisBuilderCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.EXECUTED,
                hash: 'sha256:abc',
                os: 'linux',
                size: 1024,
            };

            await handleAnalysisBuilderEvent(
                payload,
                createContext<AnalysisBuilderEventMap>(AnalysisBuilderEvent.CHECK_FINISHED),
                dataSource,
            );

            const entity = await findAnalysis(analysis.id);
            expect(entity.build_status).toBe(ProcessStatus.EXECUTED);
            expect(entity.build_progress).toBe(100);
            expect(entity.build_hash).toBe('sha256:abc');
            expect(entity.build_os).toBe('linux');
            expect(entity.build_size).toBe(1024);
        });

        it('should keep build metadata and progress on CHECK_FINISHED with in-progress status', async () => {
            const analysis = await createAnalysis({
                build_status: ProcessStatus.STARTED,
                build_progress: 40,
                build_hash: 'sha256:previous',
                build_os: 'linux',
                build_size: 512,
            });

            const payload: AnalysisBuilderCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.STARTED,
            };

            await handleAnalysisBuilderEvent(
                payload,
                createContext<AnalysisBuilderEventMap>(AnalysisBuilderEvent.CHECK_FINISHED),
                dataSource,
            );

            const entity = await findAnalysis(analysis.id);
            expect(entity.build_status).toBe(ProcessStatus.STARTED);
            expect(entity.build_progress).toBe(40);
            expect(entity.build_hash).toBe('sha256:previous');
            expect(entity.build_os).toBe('linux');
            expect(entity.build_size).toBe(512);
        });

        it('should reset build artifacts on CHECK_FINISHED with status FAILED (data loss recovery)', async () => {
            const analysis = await createAnalysis({
                configuration_locked: true,
                build_nodes_valid: true,
                build_status: ProcessStatus.EXECUTED,
                build_progress: 100,
                build_hash: 'sha256:lost',
                build_os: 'linux',
                build_size: 512,
            });

            const payload: AnalysisBuilderCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.FAILED,
            };

            await handleAnalysisBuilderEvent(
                payload,
                createContext<AnalysisBuilderEventMap>(AnalysisBuilderEvent.CHECK_FINISHED),
                dataSource,
            );

            const entity = await findAnalysis(analysis.id);
            expect(entity.build_status).toBe(ProcessStatus.FAILED);
            expect(entity.build_progress).toBe(0);
            expect(entity.build_hash).toBeNull();
            expect(entity.build_os).toBeNull();
            expect(entity.build_size).toBeNull();

            // the analysis must be rebuildable again after the reset
            expect(() => AnalysisBuilderCommandChecker.canStart(entity)).not.toThrow();
        });

        it('should not modify the entity on CHECK_FINISHED without status', async () => {
            const analysis = await createAnalysis({
                build_status: ProcessStatus.STARTING,
                build_hash: 'sha256:previous',
            });

            const payload: AnalysisBuilderCheckFinishedPayload = { id: analysis.id };

            await handleAnalysisBuilderEvent(
                payload,
                createContext<AnalysisBuilderEventMap>(AnalysisBuilderEvent.CHECK_FINISHED),
                dataSource,
            );

            const entity = await findAnalysis(analysis.id);
            expect(entity.build_status).toBe(ProcessStatus.STARTING);
            expect(entity.build_hash).toBe('sha256:previous');
        });

        it('should not mark the build as FAILED on CHECK_FAILED', async () => {
            const analysis = await createAnalysis({
                build_status: ProcessStatus.STARTED,
                build_progress: 40,
            });

            await handleAnalysisBuilderEvent(
                { id: analysis.id },
                createContext<AnalysisBuilderEventMap>(AnalysisBuilderEvent.CHECK_FAILED),
                dataSource,
            );

            const entity = await findAnalysis(analysis.id);
            expect(entity.build_status).toBe(ProcessStatus.STARTED);
            expect(entity.build_progress).toBe(40);
        });

        it('should mark the build as FAILED on EXECUTION_FAILED', async () => {
            const analysis = await createAnalysis({ build_status: ProcessStatus.STARTED });

            await handleAnalysisBuilderEvent(
                { id: analysis.id },
                createContext<AnalysisBuilderEventMap>(AnalysisBuilderEvent.EXECUTION_FAILED),
                dataSource,
            );

            const entity = await findAnalysis(analysis.id);
            expect(entity.build_status).toBe(ProcessStatus.FAILED);
        });
    });

    describe('analysis-distributor', () => {
        it('should mark the distribution as EXECUTED on CHECK_FINISHED with status EXECUTED', async () => {
            const analysis = await createAnalysis({
                build_status: ProcessStatus.EXECUTED,
                distribution_status: ProcessStatus.STARTED,
                distribution_progress: 40,
            });

            const payload: AnalysisDistributorCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.EXECUTED,
            };

            await handleAnalysisDistributorEvent(
                payload,
                createContext<AnalysisDistributorEventMap>(AnalysisDistributorEvent.CHECK_FINISHED),
                dataSource,
            );

            const entity = await findAnalysis(analysis.id);
            expect(entity.distribution_status).toBe(ProcessStatus.EXECUTED);
            expect(entity.distribution_progress).toBe(100);
        });

        it('should mark the distribution as FAILED on CHECK_FINISHED with status FAILED', async () => {
            const analysis = await createAnalysis({
                build_status: ProcessStatus.EXECUTED,
                distribution_status: ProcessStatus.STARTED,
                distribution_progress: 40,
            });

            const payload: AnalysisDistributorCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.FAILED,
            };

            await handleAnalysisDistributorEvent(
                payload,
                createContext<AnalysisDistributorEventMap>(AnalysisDistributorEvent.CHECK_FINISHED),
                dataSource,
            );

            const entity = await findAnalysis(analysis.id);
            expect(entity.distribution_status).toBe(ProcessStatus.FAILED);
            expect(entity.distribution_progress).toBe(0);
        });

        it('should keep progress on CHECK_FINISHED with in-progress status', async () => {
            const analysis = await createAnalysis({
                build_status: ProcessStatus.EXECUTED,
                distribution_status: ProcessStatus.STARTED,
                distribution_progress: 40,
            });

            const payload: AnalysisDistributorCheckFinishedPayload = {
                id: analysis.id,
                status: ProcessStatus.STARTED,
            };

            await handleAnalysisDistributorEvent(
                payload,
                createContext<AnalysisDistributorEventMap>(AnalysisDistributorEvent.CHECK_FINISHED),
                dataSource,
            );

            const entity = await findAnalysis(analysis.id);
            expect(entity.distribution_status).toBe(ProcessStatus.STARTED);
            expect(entity.distribution_progress).toBe(40);
        });

        it('should not modify the entity on CHECK_FINISHED without status', async () => {
            const analysis = await createAnalysis({
                build_status: ProcessStatus.EXECUTED,
                distribution_status: ProcessStatus.STARTING,
            });

            const payload: AnalysisDistributorCheckFinishedPayload = { id: analysis.id };

            await handleAnalysisDistributorEvent(
                payload,
                createContext<AnalysisDistributorEventMap>(AnalysisDistributorEvent.CHECK_FINISHED),
                dataSource,
            );

            const entity = await findAnalysis(analysis.id);
            expect(entity.distribution_status).toBe(ProcessStatus.STARTING);
        });

        it('should not mark the distribution as FAILED on CHECK_FAILED', async () => {
            const analysis = await createAnalysis({
                build_status: ProcessStatus.EXECUTED,
                distribution_status: ProcessStatus.STARTED,
                distribution_progress: 40,
            });

            await handleAnalysisDistributorEvent(
                { id: analysis.id },
                createContext<AnalysisDistributorEventMap>(AnalysisDistributorEvent.CHECK_FAILED),
                dataSource,
            );

            const entity = await findAnalysis(analysis.id);
            expect(entity.distribution_status).toBe(ProcessStatus.STARTED);
            expect(entity.distribution_progress).toBe(40);
        });

        it('should mark the distribution as FAILED on EXECUTION_FAILED', async () => {
            const analysis = await createAnalysis({
                build_status: ProcessStatus.EXECUTED,
                distribution_status: ProcessStatus.STARTED,
            });

            await handleAnalysisDistributorEvent(
                { id: analysis.id },
                createContext<AnalysisDistributorEventMap>(AnalysisDistributorEvent.EXECUTION_FAILED),
                dataSource,
            );

            const entity = await findAnalysis(analysis.id);
            expect(entity.distribution_status).toBe(ProcessStatus.FAILED);
        });
    });
});
