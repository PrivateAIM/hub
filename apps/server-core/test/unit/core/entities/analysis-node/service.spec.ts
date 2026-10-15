/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type {
    Analysis,
    AnalysisNode,
    Node,
    ProjectNode,
} from '@privateaim/core-kit';
import { AnalysisNodeApprovalStatus, NodeType } from '@privateaim/core-kit';
import { BadRequestError, PermissionDeniedError } from '@privateaim/errors';
import { PermissionName, ProcessStatus } from '@privateaim/kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisNodeService } from '../../../../../src/core/entities/analysis-node/service.ts';
import { AnalysisReachService } from '../../../../../src/core/services/analysis-reach/index.ts';
import {
    FakeEntityRepository,
    createAllowAllActor,
    createNonMasterRealmActor,
    createPermissionActor,
} from '../../helpers/index.ts';
import { FakeAnalysisNodeMetadataRecalculator } from './fake-metadata-recalculator.ts';
import { FakeAnalysisNodeRepository } from './fake-repository.ts';
import { FakeProjectNodeRepository } from '../project-node/fake-repository.ts';
import { createTestAnalysisNode } from '../../../../utils/domains/index.ts';

function createFakeAnalysisNodeRepository(projectId: string) {
    const repo = new FakeAnalysisNodeRepository();

    const originalValidateJoinColumns = repo.validateJoinColumns.bind(repo);
    repo.validateJoinColumns = async (data: Partial<AnalysisNode>) => {
        await originalValidateJoinColumns(data);

        if (!data.analysis) {
            data.analysis = {
                id: data.analysisId,
                realmId: 'realm-1',
                projectId,
                configurationLocked: false,
            } as Analysis;
        }

        if (!data.node) {
            data.node = {
                id: data.nodeId,
                name: 'test-node',
                type: NodeType.DEFAULT,
                realmId: 'realm-1',
                registryId: 'registry-1',
            } as Node;
        }
    };

    return repo;
}

describe('AnalysisNodeService', () => {
    let repository: FakeAnalysisNodeRepository;
    let analysisRepository: FakeEntityRepository<Analysis>;
    let nodeRepository: FakeEntityRepository<Node>;
    let recalculator: FakeAnalysisNodeMetadataRecalculator;
    let service: AnalysisNodeService;
    let analysisId: string;
    let nodeId: string;

    beforeEach(() => {
        analysisId = randomUUID();
        nodeId = randomUUID();
        const projectId = randomUUID();

        repository = createFakeAnalysisNodeRepository(projectId);
        const projectNodeRepository = new FakeProjectNodeRepository();
        analysisRepository = new FakeEntityRepository<Analysis>();
        nodeRepository = new FakeEntityRepository<Node>();
        recalculator = new FakeAnalysisNodeMetadataRecalculator(analysisRepository);

        projectNodeRepository.seed({
            id: randomUUID(),
            projectId,
            nodeId,
        } as ProjectNode);

        analysisRepository.seed({
            id: analysisId,
            realmId: 'realm-1',
        } as Analysis);

        service = new AnalysisNodeService({
            repository,
            analysisRepository,
            projectNodeRepository,
            recalculator,
            reach: new AnalysisReachService({
                analysisNodeRepository: repository,
                analysisRepository,
                nodeRepository,
            }),
            skipAnalysisApproval: true,
        });
    });

    describe('getMany', () => {
        it('should return every row of a reachable analysis, other nodes\' rows included', async () => {
            repository.seed([
                createTestAnalysisNode({
                    id: 'mine', 
                    analysisId: 'a-1', 
                    analysisRealmId: 'realm-b', 
                    nodeId: 'n-a', 
                    nodeRealmId: 'realm-a', 
                }),
                createTestAnalysisNode({
                    id: 'peer', 
                    analysisId: 'a-1', 
                    analysisRealmId: 'realm-b', 
                    nodeId: 'n-c', 
                    nodeRealmId: 'realm-c', 
                }),
                createTestAnalysisNode({
                    id: 'foreign', 
                    analysisId: 'a-2', 
                    analysisRealmId: 'realm-c', 
                    nodeId: 'n-c', 
                    nodeRealmId: 'realm-c', 
                }),
            ]);

            const result = await service.getMany({}, createNonMasterRealmActor('realm-a'));

            expect(result.data.map((e) => e.id).sort()).toEqual(['mine', 'peer']);
        });

        it('should narrow a node client to its own node\'s analyses, not its realm\'s', async () => {
            nodeRepository.seed({
                id: 'n-a', 
                clientId: 'client-a', 
                realmId: 'realm-a', 
            } as Node);
            repository.seed([
                createTestAnalysisNode({
                    id: 'mine', 
                    analysisId: 'a-1', 
                    analysisRealmId: 'realm-a', 
                    nodeId: 'n-a', 
                    nodeRealmId: 'realm-a', 
                }),
                createTestAnalysisNode({
                    id: 'sibling', 
                    analysisId: 'a-2', 
                    analysisRealmId: 'realm-a', 
                    nodeId: 'n-b', 
                    nodeRealmId: 'realm-a', 
                }),
            ]);

            const actor = createNonMasterRealmActor('realm-a');
            actor.identity = {
                id: 'client-a', 
                type: 'client', 
                realmId: 'realm-a', 
            };
            actor.permissionEvaluator.setCompileResult({ verdict: 'allow' });

            const result = await service.getMany({}, actor);

            expect(result.data.map((e) => e.id)).toEqual(['mine']);
        });
    });

    describe('create', () => {
        it('should call recalc after save', async () => {
            const result = await service.create(
                { analysisId, nodeId },
                createAllowAllActor(),
            );

            expect(result.analysisId).toBe(analysisId);
            expect(recalculator.getCallCount()).toBe(1);
            expect(recalculator.getCalls()[0]).toBe(analysisId);
        });

        it('should not use debounced recalc on create', async () => {
            await service.create(
                { analysisId, nodeId },
                createAllowAllActor(),
            );

            expect(recalculator.getDebouncedCallCount()).toBe(0);
        });

        it('should be idempotent when the node is already assigned', async () => {
            const existing = createTestAnalysisNode({
                id: 'existing-node',
                analysisId,
                nodeId,
                analysisRealmId: 'realm-1',
                nodeRealmId: 'realm-1',
                approvalStatus: null,
            });
            repository.seed(existing);

            // A repeated assignment must not create a duplicate, and must not be able to
            // escalate the approval decision — that is reserved for update() with the
            // node-authority permission checks.
            const result = await service.create(
                {
                    analysisId,
                    nodeId,
                    approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
                },
                createAllowAllActor(),
            );

            expect(result.id).toBe('existing-node');
            expect(result.approvalStatus).toBeNull();
            expect(
                repository.getAll().filter(
                    (node) => node.analysisId === analysisId && node.nodeId === nodeId,
                ),
            ).toHaveLength(1);
        });
    });

    describe('update', () => {
        it('should call recalcDebounced after save', async () => {
            const node = createTestAnalysisNode({
                analysisId,
                analysisRealmId: 'realm-1',
                nodeRealmId: 'realm-1',
            });
            repository.seed(node);

            await service.update(
                node.id,
                { executionProgress: 50 },
                createAllowAllActor(),
            );

            expect(recalculator.getDebouncedCallCount()).toBe(1);
            expect(recalculator.getDebouncedCalls()[0]).toBe(analysisId);
        });

        it('should not use immediate recalc on update', async () => {
            const node = createTestAnalysisNode({
                analysisId,
                analysisRealmId: 'realm-1',
                nodeRealmId: 'realm-1',
            });
            repository.seed(node);

            await service.update(
                node.id,
                { executionProgress: 50 },
                createAllowAllActor(),
            );

            expect(recalculator.getCallCount()).toBe(0);
        });

        // A missing right is a denial (403), not a malformed request (400).
        it.each([
            ['approvalStatus without ANALYSIS_APPROVE', { approvalStatus: AnalysisNodeApprovalStatus.APPROVED }, PermissionName.ANALYSIS_UPDATE],
            ['executionStatus without ANALYSIS_UPDATE', { executionStatus: ProcessStatus.EXECUTING }, PermissionName.ANALYSIS_APPROVE],
        ] as const)('should deny setting %s', async (_label, data, permission) => {
            const node = createTestAnalysisNode({
                analysisId,
                analysisRealmId: 'realm-1',
                nodeRealmId: 'realm-1',
            });
            repository.seed(node);

            await expect(service.update(
                node.id,
                data,
                createPermissionActor({ realm: { id: 'realm-1', name: 'realm-1' }, permissions: [permission] }),
            )).rejects.toThrow(PermissionDeniedError);
        });

        it('should deny an approval from the analysis realm alone', async () => {
            const node = createTestAnalysisNode({
                analysisId,
                analysisRealmId: 'realm-1',
                nodeRealmId: 'realm-2',
            });
            repository.seed(node);

            await expect(service.update(
                node.id,
                { approvalStatus: AnalysisNodeApprovalStatus.APPROVED },
                createPermissionActor({
                    realm: { id: 'realm-1', name: 'realm-1' },
                    permissions: [PermissionName.ANALYSIS_APPROVE],
                }),
            )).rejects.toThrow(PermissionDeniedError);
        });
    });

    describe('approval', () => {
        async function seedNode(buildStatus: Analysis['buildStatus']) {
            const analysis = await analysisRepository.findOneById(analysisId);
            await analysisRepository.save({ ...analysis!, buildStatus });

            const node = createTestAnalysisNode({
                analysisId,
                analysisRealmId: 'realm-1',
                nodeRealmId: 'realm-1',
                approvalStatus: null,
            });
            repository.seed(node);

            return node;
        }

        it('should reject an approval before the image is built', async () => {
            const node = await seedNode(ProcessStatus.STARTED);

            await expect(service.update(
                node.id,
                { approvalStatus: AnalysisNodeApprovalStatus.APPROVED },
                createAllowAllActor(),
            )).rejects.toThrow(BadRequestError);
        });

        it('should accept an approval once the image is built', async () => {
            const node = await seedNode(ProcessStatus.EXECUTED);

            const result = await service.update(
                node.id,
                { approvalStatus: AnalysisNodeApprovalStatus.APPROVED },
                createAllowAllActor(),
            );

            expect(result.approvalStatus).toBe(AnalysisNodeApprovalStatus.APPROVED);
        });

        it('should accept re-sending an approval the node already holds', async () => {
            const node = await seedNode(null);
            await repository.save({ ...node, approvalStatus: AnalysisNodeApprovalStatus.APPROVED });

            const result = await service.update(
                node.id,
                { approvalStatus: AnalysisNodeApprovalStatus.APPROVED, executionStatus: ProcessStatus.STARTED },
                createAllowAllActor(),
            );

            expect(result.executionStatus).toBe(ProcessStatus.STARTED);
        });

        it('should accept a rejection before the image is built', async () => {
            const node = await seedNode(null);

            const result = await service.update(
                node.id,
                { approvalStatus: AnalysisNodeApprovalStatus.REJECTED },
                createAllowAllActor(),
            );

            expect(result.approvalStatus).toBe(AnalysisNodeApprovalStatus.REJECTED);
        });
    });

    describe('delete', () => {
        it('should call recalc after remove', async () => {
            const node = createTestAnalysisNode({
                analysisId,
                analysisRealmId: 'realm-1',
                nodeRealmId: 'realm-1',
            });
            repository.seed(node);

            await service.delete(node.id, createAllowAllActor());

            expect(recalculator.getCallCount()).toBe(1);
            expect(recalculator.getCalls()[0]).toBe(analysisId);
        });

        it('should not use debounced recalc on delete', async () => {
            const node = createTestAnalysisNode({
                analysisId,
                analysisRealmId: 'realm-1',
                nodeRealmId: 'realm-1',
            });
            repository.seed(node);

            await service.delete(node.id, createAllowAllActor());

            expect(recalculator.getDebouncedCallCount()).toBe(0);
        });
    });
});
