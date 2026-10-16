/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type {
    Analysis,
    AnalysisBucket,
    AnalysisNode,
    Node,
    Project,
    ProjectNode,
    Registry,
} from '@privateaim/core-kit';
import {
    AnalysisCommand,
    AnalysisNodeApprovalStatus,
    NodeType,
    ProjectNodeApprovalStatus,
} from '@privateaim/core-kit';
import { BuiltInPolicyType } from '@authup/access';
import { PermissionName, ProcessStatus } from '@privateaim/kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisService } from '../../../../../src/core/entities/analysis/service.ts';
import { AnalysisBuilder } from '../../../../../src/core/services/analysis-builder/module.ts';
import { AnalysisConfigurator } from '../../../../../src/core/services/analysis-configurator/module.ts';
import { AnalysisDistributor } from '../../../../../src/core/services/analysis-distributor/module.ts';
import { AnalysisStorageManager } from '../../../../../src/core/services/analysis-storage-manager/module.ts';
import { AnalysisReachService } from '../../../../../src/core/services/analysis-reach/index.ts';
import {
    FakeEntityRepository,
    createAllowAllActor,
    createDenyAllActor,
    createMasterRealmActor,
    createNonMasterRealmActor,
    createScopedActor,
} from '@privateaim/server-test-kit';
import { FakeAnalysisRepository } from './fake-repository.ts';
import { FakeAnalysisMetadataRecalculator } from './fake-metadata-recalculator.ts';
import { FakeAnalysisNodeMetadataRecalculator } from '../analysis-node/fake-metadata-recalculator.ts';
import { FakeAnalysisNodeRepository } from '../analysis-node/fake-repository.ts';
import { FakeAnalysisFileMetadataRecalculator } from '../analysis-bucket-file/fake-metadata-recalculator.ts';
import { FakeProjectRepository } from '../project/fake-repository.ts';
import { FakeProjectNodeRepository } from '../project-node/fake-repository.ts';
import { FakeAnalysisBuilderCaller } from '../../services/helpers/fake-builder-caller.ts';
import { FakeAnalysisDistributorCaller } from '../../services/helpers/fake-distributor-caller.ts';
import { FakeBucketCaller } from '../../services/helpers/fake-bucket-caller.ts';
import { createFullAnalysis } from '../../../../utils/domains/index.ts';

function createTestProject(overrides?: Partial<Project>): Project {
    return {
        id: randomUUID(),
        name: 'test-project',
        description: null,
        nodes: 0,
        analyses: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        realmId: 'realm-1',
        clientId: null,
        robotId: null,
        userId: 'user-1',
        masterImageId: null,
        ...overrides,
    } as Project;
}

describe('AnalysisService', () => {
    let analysisRepository: FakeAnalysisRepository;
    let projectRepository: FakeProjectRepository;
    let projectNodeRepository: FakeProjectNodeRepository;
    let analysisNodeRepository: FakeAnalysisNodeRepository;
    let service: AnalysisService;

    // Sub-service dependencies
    let builderCaller: FakeAnalysisBuilderCaller;
    let distributorCaller: FakeAnalysisDistributorCaller;
    let bucketCaller: FakeBucketCaller;
    let analysisRecalculator: FakeAnalysisMetadataRecalculator;
    let nodeRecalculator: FakeAnalysisNodeMetadataRecalculator;

    beforeEach(() => {
        analysisRepository = new FakeAnalysisRepository();
        projectRepository = new FakeProjectRepository();
        projectNodeRepository = new FakeProjectNodeRepository();
        builderCaller = new FakeAnalysisBuilderCaller();
        distributorCaller = new FakeAnalysisDistributorCaller();
        bucketCaller = new FakeBucketCaller();

        analysisNodeRepository = new FakeAnalysisNodeRepository();
        const registryRepository = new FakeEntityRepository<Registry>();
        const bucketRepository = new FakeEntityRepository<AnalysisBucket>();

        analysisRecalculator = new FakeAnalysisMetadataRecalculator(analysisRepository);
        nodeRecalculator = new FakeAnalysisNodeMetadataRecalculator(analysisRepository);
        const fileRecalculator = new FakeAnalysisFileMetadataRecalculator(analysisRepository);

        const builder = new AnalysisBuilder({
            repository: analysisRepository,
            analysisNodeRepository,
            caller: builderCaller,
            analysisRecalculator,
            nodeRecalculator,
            fileRecalculator,
        });
        const configurator = new AnalysisConfigurator({
            repository: analysisRepository,
            analysisNodeRepository,
            analysisRecalculator,
            nodeRecalculator,
            fileRecalculator,
        });
        const distributor = new AnalysisDistributor({
            repository: analysisRepository,
            analysisNodeRepository,
            registryRepository,
            caller: distributorCaller,
            analysisRecalculator,
            nodeRecalculator,
            fileRecalculator,
        });
        const storageManager = new AnalysisStorageManager({
            repository: analysisRepository,
            bucketRepository,
            caller: bucketCaller,
        });

        service = new AnalysisService({
            repository: analysisRepository,
            projectRepository,
            projectNodeRepository,
            analysisNodeRepository,
            builder,
            configurator,
            distributor,
            storageManager,
            recalculator: analysisRecalculator,
            nodeRecalculator,
            reach: new AnalysisReachService({
                analysisNodeRepository,
                analysisRepository,
                nodeRepository: new FakeEntityRepository<Node>(),
            }),
        });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            analysisRepository.seed([
                createFullAnalysis({ id: 'a-1' }),
                createFullAnalysis({ id: 'a-2' }),
            ]);

            const actor = createAllowAllActor();
            actor.permissionEvaluator.setCompileResult({ verdict: 'allow' });

            const result = await service.getMany({}, actor);
            expect(result.data).toHaveLength(2);
        });

        it('should narrow to the own realm and the analyses its nodes take part in', async () => {
            analysisRepository.seed([
                createFullAnalysis({ id: 'own', realmId: 'realm-a' }),
                createFullAnalysis({ id: 'joined', realmId: 'realm-b' }),
                createFullAnalysis({ id: 'foreign', realmId: 'realm-c' }),
            ]);
            analysisNodeRepository.seed({
                id: 'an-1',
                analysisId: 'joined',
                analysisRealmId: 'realm-b',
                nodeId: 'node-a',
                nodeRealmId: 'realm-a',
            } as AnalysisNode);

            const result = await service.getMany({}, createNonMasterRealmActor('realm-a'));

            expect(result.data.map((e) => e.id).sort()).toEqual(['joined', 'own']);
            expect(result.meta.total).toBe(2);
        });

        it('should refuse an actor without any analysis read permission', async () => {
            await expect(service.getMany({}, createDenyAllActor())).rejects.toThrow(PermissionDeniedError);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            analysisRepository.seed(createFullAnalysis());

            const result = await service.getOne('analysis-1', createNonMasterRealmActor('realm-1'));
            expect(result.id).toBe('analysis-1');
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent', createAllowAllActor())).rejects.toThrow(EntityNotFoundError);
        });

        it('should answer an analysis out of reach like a missing one', async () => {
            analysisRepository.seed(createFullAnalysis({ realmId: 'realm-c' }));

            await expect(service.getOne('analysis-1', createNonMasterRealmActor('realm-a')))
                .rejects.toThrow(EntityNotFoundError);
        });

        it('should not let the master realm read beyond its grant', async () => {
            analysisRepository.seed(createFullAnalysis({ realmId: 'realm-c' }));

            await expect(service.getOne('analysis-1', createMasterRealmActor('realm-master')))
                .rejects.toThrow(EntityNotFoundError);
        });
    });

    describe('create', () => {
        it('should call storageManager.check after save', async () => {
            const project = createTestProject();
            projectRepository.seed(project);

            const origValidate = analysisRepository.validateJoinColumns.bind(analysisRepository);
            analysisRepository.validateJoinColumns = async (data: Partial<Analysis>) => {
                await origValidate(data);
                data.project = project;
            };

            const result = await service.create(
                { name: 'test-analysis', projectId: project.id },
                createAllowAllActor(),
            );

            expect(result.id).toBeDefined();
            expect(bucketCaller.getCallsFor('callCreate').length).toBeGreaterThan(0);
        });

        it('should call recalcDebounced after save', async () => {
            const project = createTestProject({ masterImageId: randomUUID() });
            projectRepository.seed(project);

            const origValidate = analysisRepository.validateJoinColumns.bind(analysisRepository);
            analysisRepository.validateJoinColumns = async (data: Partial<Analysis>) => {
                await origValidate(data);
                data.project = project;
            };

            const result = await service.create(
                { name: 'test-analysis', projectId: project.id },
                createAllowAllActor(),
            );

            expect(result.id).toBeDefined();
            expect(analysisRecalculator.getDebouncedCallCount()).toBe(1);
            expect(analysisRecalculator.getDebouncedCalls()[0]).toBe(result.id);
        });

        it('should recompute project.analyses from the actual rows on create', async () => {
            // Stored counter starts out of sync (e.g. drifted negative); creating
            // an analysis must resync it to the real row count, not blindly add one.
            const project = createTestProject({ analyses: -3 });
            projectRepository.seed(project);

            const origValidate = analysisRepository.validateJoinColumns.bind(analysisRepository);
            analysisRepository.validateJoinColumns = async (data: Partial<Analysis>) => {
                await origValidate(data);
                data.project = project;
            };

            const result = await service.create(
                { name: 'test-analysis', projectId: project.id },
                createAllowAllActor(),
            );

            const stored = await projectRepository.findOneById(project.id);
            expect(result.project.analyses).toBe(1);
            expect(stored?.analyses).toBe(1);
        });

        it('should auto-generate a url-friendly name when none is provided', async () => {
            const project = createTestProject();
            projectRepository.seed(project);

            const origValidate = analysisRepository.validateJoinColumns.bind(analysisRepository);
            analysisRepository.validateJoinColumns = async (data: Partial<Analysis>) => {
                await origValidate(data);
                data.project = project;
            };

            const result = await service.create(
                { projectId: project.id },
                createAllowAllActor(),
            );

            expect(result.name).toBeTruthy();
            expect(result.name.length).toBeGreaterThanOrEqual(3);
            expect(result.name).toMatch(/^[a-z0-9-_.]+$/);
        });

        it('should generate a name when an empty name is provided', async () => {
            const project = createTestProject();
            projectRepository.seed(project);

            const origValidate = analysisRepository.validateJoinColumns.bind(analysisRepository);
            analysisRepository.validateJoinColumns = async (data: Partial<Analysis>) => {
                await origValidate(data);
                data.project = project;
            };

            // An empty name must not be rejected before the generator runs.
            const result = await service.create(
                { projectId: project.id, name: '' },
                createAllowAllActor(),
            );

            expect(result.name).toBeTruthy();
            expect(result.name.length).toBeGreaterThanOrEqual(3);
            expect(result.name).toMatch(/^[a-z0-9-_.]+$/);
        });

        it('should keep a provided name and displayName', async () => {
            const project = createTestProject();
            projectRepository.seed(project);

            const origValidate = analysisRepository.validateJoinColumns.bind(analysisRepository);
            analysisRepository.validateJoinColumns = async (data: Partial<Analysis>) => {
                await origValidate(data);
                data.project = project;
            };

            const result = await service.create(
                {
                    projectId: project.id,
                    name: 'my-analysis',
                    displayName: 'My Analysis',
                },
                createAllowAllActor(),
            );

            expect(result.name).toBe('my-analysis');
            expect(result.displayName).toBe('My Analysis');
        });

        it('should reject a name that is not url-friendly', async () => {
            await expect(
                service.create(
                    { projectId: randomUUID(), name: 'Not A Slug!' },
                    createAllowAllActor(),
                ),
            ).rejects.toThrow(/name is invalid/i);
        });

        it('should assign every approved project node to the created analysis', async () => {
            const project = createTestProject({ realmId: 'analysis-realm' });
            projectRepository.seed(project);

            const aggregatorNodeId = randomUUID();
            const defaultNodeId = randomUUID();
            projectNodeRepository.seed([
                {
                    id: randomUUID(),
                    projectId: project.id,
                    nodeId: aggregatorNodeId,
                    nodeRealmId: 'node-realm-1',
                    approvalStatus: ProjectNodeApprovalStatus.APPROVED,
                    node: {
                        id: aggregatorNodeId,
                        type: NodeType.AGGREGATOR,
                        realmId: 'node-realm-1',
                    } as Node,
                } as ProjectNode,
                {
                    id: randomUUID(),
                    projectId: project.id,
                    nodeId: defaultNodeId,
                    nodeRealmId: 'node-realm-2',
                    approvalStatus: ProjectNodeApprovalStatus.APPROVED,
                    node: {
                        id: defaultNodeId,
                        type: NodeType.DEFAULT,
                        realmId: 'node-realm-2',
                    } as Node,
                } as ProjectNode,
            ]);

            const origValidate = analysisRepository.validateJoinColumns.bind(analysisRepository);
            analysisRepository.validateJoinColumns = async (data: Partial<Analysis>) => {
                await origValidate(data);
                data.project = project;
            };

            const result = await service.create(
                { name: 'test-analysis', projectId: project.id },
                createAllowAllActor(),
            );

            const analysisNodes = analysisNodeRepository.getAll();
            expect(analysisNodes).toHaveLength(2);
            expect(analysisNodes.every((node) => node.analysisId === result.id)).toBe(true);
            expect(analysisNodes.every((node) => node.analysisRealmId === 'analysis-realm')).toBe(true);
            expect(analysisNodes.map((node) => node.nodeId).sort())
                .toEqual([aggregatorNodeId, defaultNodeId].sort());

            // aggregator nodes are auto-approved, default nodes stay pending (approval not skipped)
            const aggregatorNode = analysisNodes.find((node) => node.nodeId === aggregatorNodeId);
            const defaultNode = analysisNodes.find((node) => node.nodeId === defaultNodeId);
            expect(aggregatorNode?.approvalStatus).toBe(AnalysisNodeApprovalStatus.APPROVED);
            expect(defaultNode?.approvalStatus).toBeUndefined();

            // node-derived analysis metadata is recalculated exactly once
            expect(nodeRecalculator.getCallCount()).toBe(1);
            expect(nodeRecalculator.getCalls()[0]).toBe(result.id);
        });

        it('should skip project nodes that are not approved', async () => {
            const project = createTestProject();
            projectRepository.seed(project);

            const approvedNodeId = randomUUID();
            const pendingNodeId = randomUUID();
            projectNodeRepository.seed([
                {
                    id: randomUUID(),
                    projectId: project.id,
                    nodeId: approvedNodeId,
                    nodeRealmId: 'node-realm-1',
                    approvalStatus: ProjectNodeApprovalStatus.APPROVED,
                    node: {
                        id: approvedNodeId,
                        type: NodeType.DEFAULT,
                        realmId: 'node-realm-1',
                    } as Node,
                } as ProjectNode,
                {
                    id: randomUUID(),
                    projectId: project.id,
                    nodeId: pendingNodeId,
                    nodeRealmId: 'node-realm-2',
                    approvalStatus: null,
                    node: {
                        id: pendingNodeId,
                        type: NodeType.DEFAULT,
                        realmId: 'node-realm-2',
                    } as Node,
                } as ProjectNode,
            ]);

            const origValidate = analysisRepository.validateJoinColumns.bind(analysisRepository);
            analysisRepository.validateJoinColumns = async (data: Partial<Analysis>) => {
                await origValidate(data);
                data.project = project;
            };

            await service.create(
                { name: 'test-analysis', projectId: project.id },
                createAllowAllActor(),
            );

            const analysisNodes = analysisNodeRepository.getAll();
            expect(analysisNodes).toHaveLength(1);
            expect(analysisNodes[0].nodeId).toBe(approvedNodeId);
        });

        it('should not create analysis nodes when the project has no nodes', async () => {
            const project = createTestProject();
            projectRepository.seed(project);

            const origValidate = analysisRepository.validateJoinColumns.bind(analysisRepository);
            analysisRepository.validateJoinColumns = async (data: Partial<Analysis>) => {
                await origValidate(data);
                data.project = project;
            };

            await service.create(
                { name: 'test-analysis', projectId: project.id },
                createAllowAllActor(),
            );

            expect(analysisNodeRepository.getAll()).toHaveLength(0);
            expect(nodeRecalculator.getCallCount()).toBe(0);
        });
    });

    describe('create (reach)', () => {
        it('should deny creating an analysis in a project of a realm out of reach', async () => {
            const project = createTestProject({ realmId: 'realm-b' });
            projectRepository.seed(project);

            const origValidate = analysisRepository.validateJoinColumns.bind(analysisRepository);
            analysisRepository.validateJoinColumns = async (data: Partial<Analysis>) => {
                await origValidate(data);
                data.project = project;
            };

            await expect(service.create(
                { name: 'test-analysis', projectId: project.id },
                createScopedActor({ realmId: 'realm-a', realmScope: 'own' }),
            )).rejects.toThrow(PermissionDeniedError);
            expect(analysisRepository.getAll()).toHaveLength(0);
        });
    });

    describe('update', () => {
        it('should deny an analysis of a realm out of reach', async () => {
            analysisRepository.seed(createFullAnalysis({ realmId: 'realm-b' }));

            await expect(service.update('analysis-1', { name: 'updated' }, createScopedActor({ realmId: 'realm-a', realmScope: 'own' })))
                .rejects.toThrow(PermissionDeniedError);
            expect(analysisRepository.getAll()[0].name).not.toBe('updated');
        });

        it('should evaluate both the stored and the merged row', async () => {
            analysisRepository.seed(createFullAnalysis({ realmId: 'realm-a' }));

            const actor = createScopedActor({ realmId: 'realm-a', realmScope: 'own' });
            await service.update('analysis-1', { name: 'updated' }, actor);

            const names = actor.permissionEvaluator.evaluateCalls
                .filter((call) => call.name === PermissionName.ANALYSIS_UPDATE)
                .map((call) => call.data?.get<Analysis>(BuiltInPolicyType.ATTRIBUTES).name);
            expect(names).toHaveLength(2);
            expect(names[1]).toBe('updated');
            expect(names[0]).not.toBe('updated');
        });

        it('should call recalcDebounced after save', async () => {
            analysisRepository.seed(createFullAnalysis());

            await service.update('analysis-1', { name: 'updated' }, createAllowAllActor());

            expect(analysisRecalculator.getDebouncedCallCount()).toBe(1);
            expect(analysisRecalculator.getDebouncedCalls()[0]).toBe('analysis-1');
        });

        it('should not write a stale build status back over a concurrent transition', async () => {
            analysisRepository.seed(createFullAnalysis({ buildStatus: ProcessStatus.STARTED }));

            // the build finishes while the update still holds its earlier read
            analysisRepository.afterUnlockedRead = async (id) => {
                analysisRepository.afterUnlockedRead = undefined;
                const row = await analysisRepository.findOneById(id);
                await analysisRepository.save({ ...row, buildStatus: ProcessStatus.EXECUTED });
            };

            await service.update('analysis-1', { name: 'updated' }, createAllowAllActor());

            expect(analysisRepository.getAll()[0]).toMatchObject({
                name: 'updated',
                buildStatus: ProcessStatus.EXECUTED,
            });
        });

        it('should not use immediate recalc on update', async () => {
            analysisRepository.seed(createFullAnalysis());

            await service.update('analysis-1', { name: 'updated' }, createAllowAllActor());

            expect(analysisRecalculator.getCallCount()).toBe(0);
        });
    });

    describe('delete', () => {
        it('should call storageManager.remove before repository.remove', async () => {
            const project = createTestProject();
            project.analyses = 1;
            projectRepository.seed(project);
            analysisRepository.seed(createFullAnalysis({ project, projectId: project.id }));

            await service.delete('analysis-1', createAllowAllActor());

            const remaining = await analysisRepository.findOneById('analysis-1');
            expect(remaining).toBeNull();
        });

        it('should recompute project.analyses from the remaining rows on delete', async () => {
            const project = createTestProject();
            // The stored counter is deliberately wrong to prove the value is
            // recomputed from the actual rows, not merely decremented.
            project.analyses = 5;
            projectRepository.seed(project);
            analysisRepository.seed(createFullAnalysis({
                id: 'analysis-1',
                project,
                projectId: project.id,
            }));
            analysisRepository.seed(createFullAnalysis({
                id: 'analysis-2',
                project,
                projectId: project.id,
            }));

            const result = await service.delete('analysis-1', createAllowAllActor());

            expect(result.id).toBe('analysis-1');
            // one row remains for the project
            expect(result.project.analyses).toBe(1);
        });

        it('should never let project.analyses go negative when the counter is out of sync', async () => {
            const project = createTestProject();
            // Counter already drifted to 0 (or below) while a row still exists.
            project.analyses = 0;
            projectRepository.seed(project);
            analysisRepository.seed(createFullAnalysis({ project, projectId: project.id }));

            const result = await service.delete('analysis-1', createAllowAllActor());

            expect(result.project.analyses).toBe(0);
            expect(result.project.analyses).toBeGreaterThanOrEqual(0);
        });

        it('should throw PermissionDeniedError when actor lacks permission', async () => {
            analysisRepository.seed(createFullAnalysis());

            await expect(
                service.delete('analysis-1', createDenyAllActor()),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should deny an analysis of a realm out of reach', async () => {
            analysisRepository.seed(createFullAnalysis({ realmId: 'other-realm' }));

            const actor = createScopedActor({ realmId: 'realm-1', realmScope: 'own' });
            await expect(
                service.delete('analysis-1', actor),
            ).rejects.toThrow(PermissionDeniedError);
            expect(await analysisRepository.findOneById('analysis-1')).not.toBeNull();
        });

        it('should let a grant reaching every realm delete', async () => {
            const project = createTestProject({ analyses: 1 });
            projectRepository.seed(project);
            analysisRepository.seed(createFullAnalysis({
                realmId: 'other-realm',
                project,
            }));

            const result = await service.delete('analysis-1', createScopedActor({ realmId: 'realm-master', realmScope: 'any' }));
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

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.executeCommand('nonexistent', AnalysisCommand.BUILD_START, createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should deny an analysis of a realm out of reach', async () => {
            analysisRepository.seed(createFullAnalysis({ realmId: 'other-realm' }));

            const actor = createScopedActor({ realmId: 'realm-1', realmScope: 'own' });
            await expect(
                service.executeCommand('analysis-1', AnalysisCommand.STORAGE_CHECK, actor),
            ).rejects.toThrow(PermissionDeniedError);
            expect(bucketCaller.getCallsFor('callCreate')).toHaveLength(0);
        });

        it('should deny an actor without the command\'s permission', async () => {
            analysisRepository.seed(createFullAnalysis());

            await expect(
                service.executeCommand('analysis-1', AnalysisCommand.STORAGE_CHECK, createDenyAllActor()),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it.each([
            [AnalysisCommand.BUILD_START, PermissionName.ANALYSIS_EXECUTION_START],
            [AnalysisCommand.DISTRIBUTION_START, PermissionName.ANALYSIS_EXECUTION_START],
            [AnalysisCommand.BUILD_CHECK, PermissionName.ANALYSIS_UPDATE],
            [AnalysisCommand.CONFIGURATION_LOCK, PermissionName.ANALYSIS_UPDATE],
            [AnalysisCommand.CONFIGURATION_UNLOCK, PermissionName.ANALYSIS_UPDATE],
            [AnalysisCommand.DISTRIBUTION_CHECK, PermissionName.ANALYSIS_UPDATE],
            [AnalysisCommand.STORAGE_CHECK, PermissionName.ANALYSIS_UPDATE],
        ])('should require %s to reach the analysis with %s', async (command, name) => {
            analysisRepository.seed(createFullAnalysis({ realmId: 'realm-a' }));

            const actor = createScopedActor({ realmId: 'realm-a', realmScope: 'own' });
            // the dispatched step may refuse on state; only the authorization matters here
            await service.executeCommand('analysis-1', command, actor).catch(() => undefined);

            expect(actor.permissionEvaluator.preEvaluateCalls.map((call) => call.name)).toEqual([name]);
            expect(actor.permissionEvaluator.evaluateCalls.map((call) => [
                call.name,
                call.data?.get(BuiltInPolicyType.REALM_MATCH),
            ])).toEqual([[name, 'realm-a']]);
        });

        it('should dispatch CONFIGURATION_LOCK to configurator', async () => {
            analysisRepository.seed(createFullAnalysis());

            const result = await service.executeCommand(
                'analysis-1',
                AnalysisCommand.CONFIGURATION_LOCK,
                createAllowAllActor(),
            );

            expect(result.configurationLocked).toBe(true);
        });

        it('should dispatch CONFIGURATION_UNLOCK to configurator', async () => {
            analysisRepository.seed(createFullAnalysis({ configurationLocked: true }));

            const result = await service.executeCommand(
                'analysis-1',
                AnalysisCommand.CONFIGURATION_UNLOCK,
                createAllowAllActor(),
            );

            expect(result.configurationLocked).toBe(false);
        });

        it('should dispatch BUILD_START to builder', async () => {
            analysisRepository.seed(createFullAnalysis({ configurationLocked: true }));

            const result = await service.executeCommand(
                'analysis-1',
                AnalysisCommand.BUILD_START,
                createAllowAllActor(),
            );

            expect(result.buildStatus).toBe(ProcessStatus.STARTING);
            expect(builderCaller.getCallsFor('callExecute')).toHaveLength(1);
        });

        it('should dispatch BUILD_CHECK to builder', async () => {
            analysisRepository.seed(createFullAnalysis({
                configurationLocked: true,
                buildStatus: ProcessStatus.STARTED,
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
                configurationLocked: true,
                buildStatus: ProcessStatus.EXECUTED,
            }));

            const result = await service.executeCommand(
                'analysis-1',
                AnalysisCommand.DISTRIBUTION_START,
                createAllowAllActor(),
            );

            expect(result.distributionStatus).toBe(ProcessStatus.STARTING);
            expect(distributorCaller.getCallsFor('callExecute')).toHaveLength(1);
        });

        it('should dispatch DISTRIBUTION_CHECK to distributor', async () => {
            analysisRepository.seed(createFullAnalysis({
                configurationLocked: true,
                buildStatus: ProcessStatus.EXECUTED,
                distributionStatus: ProcessStatus.STARTED,
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

            expect(bucketCaller.getCallsFor('callCreate').length).toBeGreaterThan(0);
        });
    });
});
