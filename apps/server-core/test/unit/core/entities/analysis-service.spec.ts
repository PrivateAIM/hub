/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError, ForbiddenError, NotFoundError } from '@ebec/http';
import type {
    AnalysisBucket,
    AnalysisNode,
    Project,
    Registry,
} from '@privateaim/core-kit';
import { AnalysisCommand } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import { 
    beforeEach, 
    describe, 
    expect, 
    it, 
} from 'vitest';
import { AnalysisService } from '../../../../src/core/entities/analysis/service.ts';
import { AnalysisBuilder } from '../../../../src/core/services/analysis-builder/module.ts';
import { AnalysisConfigurator } from '../../../../src/core/services/analysis-configurator/module.ts';
import { AnalysisDistributor } from '../../../../src/core/services/analysis-distributor/module.ts';
import { AnalysisStorageManager } from '../../../../src/core/services/analysis-storage-manager/module.ts';
import {
    FakeAnalysisBuilderCaller,
    FakeAnalysisDistributorCaller,
    FakeAnalysisMetadataCaller,
    FakeAnalysisRepository,
    FakeBucketCaller,
    FakeEntityRepository,
    FakeProjectRepository,
    FakeTaskManager,
    createAllowAllActor,
    createDenyAllActor,
    createMasterRealmActor,
    createNonMasterRealmActor,
} from '../helpers/index.ts';
import { createFullAnalysis } from '../../../utils/domains/index.ts';

function createTestProject(overrides?: Partial<Project>): Project {
    return {
        id: 'project-1',
        name: 'test-project',
        description: null,
        nodes: 0,
        analyses: 1,
        created_at: new Date(),
        updated_at: new Date(),
        realm_id: 'realm-1',
        client_id: null,
        robot_id: null,
        user_id: 'user-1',
        master_image_id: null,
        ...overrides,
    } as Project;
}

describe('AnalysisService', () => {
    let analysisRepository: FakeAnalysisRepository;
    let projectRepository: FakeProjectRepository;
    let service: AnalysisService;

    // Sub-service dependencies
    let metadataCaller: FakeAnalysisMetadataCaller;
    let builderCaller: FakeAnalysisBuilderCaller;
    let distributorCaller: FakeAnalysisDistributorCaller;
    let bucketCaller: FakeBucketCaller;
    let taskManager: FakeTaskManager;

    beforeEach(() => {
        analysisRepository = new FakeAnalysisRepository();
        projectRepository = new FakeProjectRepository();
        metadataCaller = new FakeAnalysisMetadataCaller(analysisRepository);
        builderCaller = new FakeAnalysisBuilderCaller();
        distributorCaller = new FakeAnalysisDistributorCaller();
        bucketCaller = new FakeBucketCaller();
        taskManager = new FakeTaskManager();

        const analysisNodeRepository = new FakeEntityRepository<AnalysisNode>();
        const registryRepository = new FakeEntityRepository<Registry>();
        const bucketRepository = new FakeEntityRepository<AnalysisBucket>();

        const builder = new AnalysisBuilder({
            repository: analysisRepository,
            caller: builderCaller,
            metadataCaller,
        });
        const configurator = new AnalysisConfigurator({
            repository: analysisRepository,
            analysisNodeRepository,
            metadataCaller,
        });
        const distributor = new AnalysisDistributor({
            repository: analysisRepository,
            analysisNodeRepository,
            registryRepository,
            caller: distributorCaller,
            metadataCaller,
        });
        const storageManager = new AnalysisStorageManager({
            repository: analysisRepository,
            bucketRepository,
            caller: bucketCaller,
            taskManager,
        });

        service = new AnalysisService({
            repository: analysisRepository,
            projectRepository,
            builder,
            configurator,
            distributor,
            storageManager,
        });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            analysisRepository.seed([
                createFullAnalysis({ id: 'a-1' }),
                createFullAnalysis({ id: 'a-2' }),
            ]);

            const result = await service.getMany({});
            expect(result.data).toHaveLength(2);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            analysisRepository.seed(createFullAnalysis());

            const result = await service.getOne('analysis-1');
            expect(result.id).toBe('analysis-1');
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent')).rejects.toThrow(NotFoundError);
        });
    });

    describe('delete', () => {
        it('should delete and decrement project.analyses', async () => {
            const project = createTestProject();
            project.analyses = 2;
            projectRepository.seed(project);
            analysisRepository.seed(createFullAnalysis({ project, project_id: project.id }));

            expect(project.analyses).toBe(2);
            const result = await service.delete('analysis-1', createAllowAllActor());

            expect(result.id).toBe('analysis-1');
            expect(result.project.analyses).toBe(1);
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            analysisRepository.seed(createFullAnalysis());

            await expect(
                service.delete('analysis-1', createDenyAllActor()),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should enforce realm writability', async () => {
            analysisRepository.seed(createFullAnalysis({ realm_id: 'other-realm' }));

            const actor = createNonMasterRealmActor('realm-1');
            await expect(
                service.delete('analysis-1', actor),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should allow master realm to delete', async () => {
            const project = createTestProject({ analyses: 1 });
            projectRepository.seed(project);
            analysisRepository.seed(createFullAnalysis({
                realm_id: 'other-realm',
                project,
            }));

            const result = await service.delete('analysis-1', createMasterRealmActor());
            expect(result.id).toBe('analysis-1');
        });
    });

    describe('executeCommand', () => {
        it('should throw BadRequestError for invalid command', async () => {
            analysisRepository.seed(createFullAnalysis());

            await expect(
                service.executeCommand('analysis-1', 'invalid_command' as `${AnalysisCommand}`, createAllowAllActor()),
            ).rejects.toThrow(BadRequestError);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.executeCommand('nonexistent', AnalysisCommand.BUILD_START, createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should enforce realm writability', async () => {
            analysisRepository.seed(createFullAnalysis({ realm_id: 'other-realm' }));

            const actor = createNonMasterRealmActor('realm-1');
            await expect(
                service.executeCommand('analysis-1', AnalysisCommand.STORAGE_CHECK, actor),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should dispatch CONFIGURATION_LOCK to configurator', async () => {
            analysisRepository.seed(createFullAnalysis());

            const result = await service.executeCommand(
                'analysis-1',
                AnalysisCommand.CONFIGURATION_LOCK,
                createAllowAllActor(),
            );

            expect(result.configuration_locked).toBe(true);
        });

        it('should dispatch CONFIGURATION_UNLOCK to configurator', async () => {
            analysisRepository.seed(createFullAnalysis({ configuration_locked: true }));

            const result = await service.executeCommand(
                'analysis-1',
                AnalysisCommand.CONFIGURATION_UNLOCK,
                createAllowAllActor(),
            );

            expect(result.configuration_locked).toBe(false);
        });

        it('should dispatch BUILD_START to builder', async () => {
            analysisRepository.seed(createFullAnalysis({ configuration_locked: true }));

            const result = await service.executeCommand(
                'analysis-1',
                AnalysisCommand.BUILD_START,
                createAllowAllActor(),
            );

            expect(result.build_status).toBe(ProcessStatus.STARTING);
            expect(builderCaller.getCallsFor('callExecute')).toHaveLength(1);
        });

        it('should dispatch BUILD_CHECK to builder', async () => {
            analysisRepository.seed(createFullAnalysis({
                configuration_locked: true,
                build_status: ProcessStatus.STARTED,
            }));

            await service.executeCommand(
                'analysis-1',
                AnalysisCommand.BUILD_CHECK,
                createAllowAllActor(),
            );

            expect(builderCaller.getCallsFor('callCheck')).toHaveLength(1);
        });

        it('should dispatch DISTRIBUTION_START to distributor', async () => {
            analysisRepository.seed(createFullAnalysis({
                configuration_locked: true,
                build_status: ProcessStatus.EXECUTED,
            }));

            const result = await service.executeCommand(
                'analysis-1',
                AnalysisCommand.DISTRIBUTION_START,
                createAllowAllActor(),
            );

            expect(result.distribution_status).toBe(ProcessStatus.STARTING);
            expect(distributorCaller.getCallsFor('callExecute')).toHaveLength(1);
        });

        it('should dispatch DISTRIBUTION_CHECK to distributor', async () => {
            analysisRepository.seed(createFullAnalysis({
                configuration_locked: true,
                build_status: ProcessStatus.EXECUTED,
            }));

            await service.executeCommand(
                'analysis-1',
                AnalysisCommand.DISTRIBUTION_CHECK,
                createAllowAllActor(),
            );

            expect(distributorCaller.getCallsFor('callCheck')).toHaveLength(1);
        });

        it('should dispatch STORAGE_CHECK to storageManager', async () => {
            analysisRepository.seed(createFullAnalysis());

            await service.executeCommand(
                'analysis-1',
                AnalysisCommand.STORAGE_CHECK,
                createAllowAllActor(),
            );

            expect(taskManager.getCallCount()).toBeGreaterThan(0);
        });
    });
});
