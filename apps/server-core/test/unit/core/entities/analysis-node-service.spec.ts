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
import { NodeType } from '@privateaim/core-kit';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisNodeService } from '../../../../src/core/entities/analysis-node/service.ts';
import {
    FakeAnalysisNodeMetadataRecalculator,
    FakeEntityRepository,
    createAllowAllActor,
} from '../helpers/index.ts';
import { createTestAnalysisNode } from '../../../utils/domains/index.ts';

function createFakeAnalysisNodeRepository(projectId: string) {
    const repo = new FakeEntityRepository<AnalysisNode>();

    const originalValidateJoinColumns = repo.validateJoinColumns.bind(repo);
    repo.validateJoinColumns = async (data: Partial<AnalysisNode>) => {
        await originalValidateJoinColumns(data);

        if (!data.analysis) {
            data.analysis = {
                id: data.analysis_id,
                realm_id: 'realm-1',
                project_id: projectId,
                configuration_locked: false,
            } as Analysis;
        }

        if (!data.node) {
            data.node = {
                id: data.node_id,
                name: 'test-node',
                type: NodeType.DEFAULT,
                realm_id: 'realm-1',
                registry_id: 'registry-1',
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
        const projectNodeRepository = new FakeEntityRepository<ProjectNode>();
        const analysisRepository = new FakeEntityRepository<Analysis>();
        recalculator = new FakeAnalysisNodeMetadataRecalculator(analysisRepository);

        projectNodeRepository.seed({
            id: randomUUID(),
            project_id: projectId,
            node_id: nodeId,
        } as ProjectNode);

        analysisRepository.seed({
            id: analysisId,
            realm_id: 'realm-1',
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
                { analysis_id: analysisId, node_id: nodeId },
                createAllowAllActor(),
            );

            expect(result.analysis_id).toBe(analysisId);
            expect(recalculator.getCallCount()).toBe(1);
            expect(recalculator.getCalls()[0]).toBe(analysisId);
        });

        it('should not use debounced recalc on create', async () => {
            await service.create(
                { analysis_id: analysisId, node_id: nodeId },
                createAllowAllActor(),
            );

            expect(recalculator.getDebouncedCallCount()).toBe(0);
        });
    });

    describe('update', () => {
        it('should call recalcDebounced after save', async () => {
            const node = createTestAnalysisNode({
                analysis_id: analysisId,
                analysis_realm_id: 'realm-1',
                node_realm_id: 'realm-1',
            });
            repository.seed(node);

            await service.update(
                node.id,
                { execution_progress: 50 },
                createAllowAllActor(),
            );

            expect(recalculator.getDebouncedCallCount()).toBe(1);
            expect(recalculator.getDebouncedCalls()[0]).toBe(analysisId);
        });

        it('should not use immediate recalc on update', async () => {
            const node = createTestAnalysisNode({
                analysis_id: analysisId,
                analysis_realm_id: 'realm-1',
                node_realm_id: 'realm-1',
            });
            repository.seed(node);

            await service.update(
                node.id,
                { execution_progress: 50 },
                createAllowAllActor(),
            );

            expect(recalculator.getCallCount()).toBe(0);
        });
    });

    describe('delete', () => {
        it('should call recalc after remove', async () => {
            const node = createTestAnalysisNode({
                analysis_id: analysisId,
                analysis_realm_id: 'realm-1',
                node_realm_id: 'realm-1',
            });
            repository.seed(node);

            await service.delete(node.id, createAllowAllActor());

            expect(recalculator.getCallCount()).toBe(1);
            expect(recalculator.getCalls()[0]).toBe(analysisId);
        });

        it('should not use debounced recalc on delete', async () => {
            const node = createTestAnalysisNode({
                analysis_id: analysisId,
                analysis_realm_id: 'realm-1',
                node_realm_id: 'realm-1',
            });
            repository.seed(node);

            await service.delete(node.id, createAllowAllActor());

            expect(recalculator.getDebouncedCallCount()).toBe(0);
        });
    });
});
