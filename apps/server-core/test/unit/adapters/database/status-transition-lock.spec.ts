/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import type { Analysis } from '@privateaim/core-kit';
import { AnalysisError } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type { AnalysisBuilderExecutionProgressPayload } from '@privateaim/server-core-worker-kit';
import {
    AnalysisBuilderEvent,
    AnalysisDistributorEvent,
    MasterImageBuilderEvent,
} from '@privateaim/server-core-worker-kit';
import { readDataSourceOptionsFromEnv } from 'typeorm-extension';
import type { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisEntity, MasterImageEntity, ProjectEntity } from '../../../../src/adapters/database/index.ts';
import { AnalysisInjectionKey } from '../../../../src/app/modules/analysis/index.ts';
import { DatabaseInjectionKey } from '../../../../src/app/modules/database/index.ts';
import { AnalysisBuilder } from '../../../../src/core/services/analysis-builder/module.ts';
import { MasterImageBuilderService } from '../../../../src/core/services/master-image/index.ts';
import { createTestDatabaseApplication } from '../../../app/index.ts';
import { FakeAnalysisBuilderDispatcher } from '../../core/services/helpers/fake-builder-dispatcher.ts';
import { FakeAnalysisMetadataRecalculator } from '../../core/entities/analysis/fake-metadata-recalculator.ts';
import { FakeAnalysisNodeMetadataRecalculator } from '../../core/entities/analysis-node/fake-metadata-recalculator.ts';
import { FakeAnalysisFileMetadataRecalculator } from '../../core/entities/analysis-bucket-file/fake-metadata-recalculator.ts';

const type = readDataSourceOptionsFromEnv()?.type;
// better-sqlite3 has no row locks — one database file per container, so no
// second replica can race it.
const lockable = type === 'mysql' || type === 'postgres';

const CONCURRENCY = 5;

/**
 * Holds every start at its last pre-lock read until all of them got there,
 * so each one has passed the early `canStart` on the same (unstarted) row —
 * the state two replicas are in when their commands arrive together.
 */
class BarrierFileMetadataRecalculator extends FakeAnalysisFileMetadataRecalculator {
    protected arrived = 0;

    protected release: () => void = () => {};

    protected gate = new Promise<void>((resolve) => {
        this.release = resolve;
    });

    async recalc(analysisId: string): Promise<Analysis> {
        const entity = await super.recalc(analysisId);

        this.arrived++;
        if (this.arrived === CONCURRENCY) {
            this.release();
        }

        await this.gate;

        return entity;
    }
}

/**
 * Plan 018 F9: concurrent start commands — one per replica — each passed
 * `canStart` on their own read and all dispatched. Against a real server the
 * status transition now runs under a row lock, so exactly one start wins.
 */
describe('status transition row lock', () => {
    const suite = createTestDatabaseApplication();
    let dataSource: DataSource;

    beforeAll(async () => {
        await suite.setup();
        dataSource = suite.container.resolve(DatabaseInjectionKey.DataSource);
    });

    afterAll(async () => {
        await suite.teardown();
    });

    it.skipIf(!lockable)('should dispatch exactly one of several concurrent build starts', async () => {
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
            configurationLocked: true,
        }));

        const repository = suite.container.resolve(DatabaseInjectionKey.AnalysisRepository);
        const dispatcher = new FakeAnalysisBuilderDispatcher();
        const builder = new AnalysisBuilder({
            repository,
            analysisNodeRepository: suite.container.resolve(DatabaseInjectionKey.AnalysisNodeRepository),
            dispatcher,
            analysisRecalculator: new FakeAnalysisMetadataRecalculator(repository),
            nodeRecalculator: new FakeAnalysisNodeMetadataRecalculator(repository),
            fileRecalculator: new BarrierFileMetadataRecalculator(repository),
        });

        // one warm connection per start, so none of them trails behind a
        // connection handshake while the others finish
        await Promise.all(Array.from({ length: CONCURRENCY }, () => dataSource.query('SELECT 1')));

        const results = await Promise.allSettled(
            Array.from({ length: CONCURRENCY }, () => builder.start(analysis.id, { ignoreApproval: true })),
        );

        const rejected = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
        expect(dispatcher.getCallsFor('dispatchExecute')).toHaveLength(1);
        expect(rejected).toHaveLength(CONCURRENCY - 1);
        for (const result of rejected) {
            expect(result.reason).toBeInstanceOf(AnalysisError);
        }

        const entity = await analysisRepository.findOneByOrFail({ id: analysis.id });
        expect(entity.buildStatus).toBe(ProcessStatus.STARTING);
    });

    /**
     * Another replica's EXECUTION_FINISHED holds the row (uncommitted EXECUTED)
     * while `run` — a late EXECUTION_PROGRESS — starts. Unlocked, the handler
     * reads the committed STARTED row, and its save writes the stale progress
     * over EXECUTED once the finish commits. Locked, it waits for the commit
     * and sees a terminal status.
     */
    async function commitWhileRunning<T extends ObjectLiteral>(
        target: EntityTarget<T>,
        id: string,
        patch: Partial<T>,
        run: () => Promise<unknown>,
    ) {
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const row = await queryRunner.manager.getRepository(target)
                .createQueryBuilder()
                .setLock('pessimistic_write')
                .whereInIds(id)
                .getOneOrFail();
            await queryRunner.manager.save(target, { ...row, ...patch });

            const pending = run();
            // let the handler reach its read (unlocked) or block on the lock (locked)
            await new Promise((resolve) => { setTimeout(resolve, 250); });

            await queryRunner.commitTransaction();
            await pending;
        } finally {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            await queryRunner.release();
        }
    }

    function createProgressPayload(id: string): AnalysisBuilderExecutionProgressPayload {
        return {
            id,
            progress: {
                current: 2,
                total: 5,
                percent: 40,
            },
        };
    }

    it.skipIf(!lockable)('should not regress an analysis build to a late EXECUTION_PROGRESS', async () => {
        const repository = dataSource.getRepository(AnalysisEntity);
        const project = await dataSource.getRepository(ProjectEntity).save({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            realmId: faker.string.uuid(),
        });
        const analysis = await repository.save(repository.create({
            name: faker.string.alpha({ length: 16, casing: 'lower' }),
            realmId: project.realmId,
            projectId: project.id,
            buildStatus: ProcessStatus.STARTED,
            buildProgress: 20,
            distributionStatus: ProcessStatus.STARTED,
            distributionProgress: 20,
        }));

        await commitWhileRunning(AnalysisEntity, analysis.id, {
            buildStatus: ProcessStatus.EXECUTED,
            buildProgress: 100,
        }, () => suite.container.resolve(AnalysisInjectionKey.Builder).applyEvent(
            AnalysisBuilderEvent.EXECUTION_PROGRESS,
            createProgressPayload(analysis.id),
        ));

        await commitWhileRunning(AnalysisEntity, analysis.id, {
            distributionStatus: ProcessStatus.EXECUTED,
            distributionProgress: 100,
        }, () => suite.container.resolve(AnalysisInjectionKey.Distributor).applyEvent(
            AnalysisDistributorEvent.EXECUTION_PROGRESS,
            createProgressPayload(analysis.id),
        ));

        expect(await repository.findOneByOrFail({ id: analysis.id })).toMatchObject({
            buildStatus: ProcessStatus.EXECUTED,
            buildProgress: 100,
            distributionStatus: ProcessStatus.EXECUTED,
            distributionProgress: 100,
        });
    });

    it.skipIf(!lockable)('should not regress a master-image build to a late EXECUTION_PROGRESS', async () => {
        const repository = dataSource.getRepository(MasterImageEntity);
        const name = faker.string.alpha({ length: 16, casing: 'lower' });
        const image = await repository.save(repository.create({
            name,
            virtualPath: `group/${name}`,
            groupVirtualPath: 'group',
            buildStatus: ProcessStatus.STARTED,
            buildProgress: 20,
        }));

        const imageRepository = suite.container.resolve(DatabaseInjectionKey.MasterImageRepository);
        const service = new MasterImageBuilderService({ imageRepository });

        await commitWhileRunning(MasterImageEntity, image.id, {
            buildStatus: ProcessStatus.EXECUTED,
            buildProgress: 100,
        }, () => service.applyEvent(
            MasterImageBuilderEvent.EXECUTION_PROGRESS,
            createProgressPayload(image.id),
        ));

        expect(await repository.findOneByOrFail({ id: image.id })).toMatchObject({
            buildStatus: ProcessStatus.EXECUTED,
            buildProgress: 100,
        });
    });
});
