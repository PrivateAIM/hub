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
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisNodeService } from '../../../../../src/core/entities/analysis-node/service.ts';
import {
    FakeEntityRepository,
    createAllowAllActor,
} from '../../helpers/index.ts';
import { FakeAnalysisNodeMetadataRecalculator } from './fake-metadata-recalculator.ts';
import { FakeProjectNodeRepository } from '../project-node/fake-repository.ts';
import { createTestAnalysisNode } from '../../../../utils/domains/index.ts';

function createFakeAnalysisNodeRepository(projectId: string) {
    const repo = new FakeEntityRepository<AnalysisNode>();

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
    let repository: FakeEntityRepository<AnalysisNode>;
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
        const analysisRepository = new FakeEntityRepository<Analysis>();
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
            projectNodeRepository,
            recalculator,
            skipAnalysisApproval: true,
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
