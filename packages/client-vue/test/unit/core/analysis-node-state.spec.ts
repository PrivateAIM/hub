/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import { describe, expect, it } from 'vitest';
import {
    ANALYSIS_NODE_LANE_BUDGET,
    buildAnalysisNodeApprovalDistribution,
    buildAnalysisNodeExecutionDistribution,
    isAnalysisNodeException,
    partitionAnalysisNodeLanes,
    resolveAnalysisNodeApprovalState,
    resolveAnalysisNodeExecutionState,
} from '../../../src/core';
import { createTestAnalysisNode } from '../../utils/factories';

const approved = () => createTestAnalysisNode({
    approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
    executionStatus: ProcessStatus.EXECUTED,
});

describe('core/analysis-node-state', () => {
    it('should map execution status onto lane states', () => {
        expect(resolveAnalysisNodeExecutionState({ executionStatus: ProcessStatus.EXECUTED })).toBe('done');
        expect(resolveAnalysisNodeExecutionState({ executionStatus: ProcessStatus.FAILED })).toBe('failed');
        expect(resolveAnalysisNodeExecutionState({ executionStatus: ProcessStatus.STARTING })).toBe('running');
        expect(resolveAnalysisNodeExecutionState({ executionStatus: ProcessStatus.EXECUTING })).toBe('running');
        expect(resolveAnalysisNodeExecutionState({ executionStatus: ProcessStatus.STOPPING })).toBe('running');
        expect(resolveAnalysisNodeExecutionState({ executionStatus: ProcessStatus.STOPPED })).toBe('waiting');
        expect(resolveAnalysisNodeExecutionState({ executionStatus: null })).toBe('waiting');
    });

    it('should map approval status onto lane states', () => {
        expect(resolveAnalysisNodeApprovalState({ approvalStatus: AnalysisNodeApprovalStatus.APPROVED })).toBe('approved');
        expect(resolveAnalysisNodeApprovalState({ approvalStatus: AnalysisNodeApprovalStatus.REJECTED })).toBe('rejected');
        expect(resolveAnalysisNodeApprovalState({ approvalStatus: null })).toBe('pending');
    });

    it('should treat unsettled approval and failed execution as exceptions', () => {
        expect(isAnalysisNodeException({ approvalStatus: null, executionStatus: null })).toBeTruthy();
        expect(isAnalysisNodeException({
            approvalStatus: AnalysisNodeApprovalStatus.REJECTED,
            executionStatus: null,
        })).toBeTruthy();
        expect(isAnalysisNodeException({
            approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
            executionStatus: ProcessStatus.FAILED,
        })).toBeTruthy();
        expect(isAnalysisNodeException({
            approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
            executionStatus: ProcessStatus.STARTED,
        })).toBeFalsy();
    });

    it('should render every lane while the fleet fits the budget', () => {
        const nodes = Array.from({ length: ANALYSIS_NODE_LANE_BUDGET }, approved);

        const partition = partitionAnalysisNodeLanes(nodes);

        expect(partition.summarized).toBeFalsy();
        expect(partition.lanes).toHaveLength(nodes.length);
        expect(partition.hidden).toHaveLength(0);
    });

    it('should lead with exceptions once the fleet exceeds the budget', () => {
        const rejected = createTestAnalysisNode({ approvalStatus: AnalysisNodeApprovalStatus.REJECTED });
        const failed = createTestAnalysisNode({
            approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
            executionStatus: ProcessStatus.FAILED,
        });
        const healthy = Array.from({ length: ANALYSIS_NODE_LANE_BUDGET }, approved);

        const partition = partitionAnalysisNodeLanes([...healthy, rejected, failed]);

        expect(partition.summarized).toBeTruthy();
        expect(partition.lanes).toEqual([rejected, failed]);
        expect(partition.hidden).toHaveLength(healthy.length);
    });

    it('should count state distributions in stable order and drop empty states', () => {
        const nodes = [
            createTestAnalysisNode({
                approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
                executionStatus: ProcessStatus.EXECUTED,
            }),
            createTestAnalysisNode({
                approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
                executionStatus: ProcessStatus.STARTED,
            }),
            createTestAnalysisNode({ approvalStatus: null, executionStatus: null }),
        ];

        expect(buildAnalysisNodeApprovalDistribution(nodes)).toEqual([
            { key: 'approved', count: 2 },
            { key: 'pending', count: 1 },
        ]);
        expect(buildAnalysisNodeExecutionDistribution(nodes)).toEqual([
            { key: 'done', count: 1 },
            { key: 'running', count: 1 },
            { key: 'waiting', count: 1 },
        ]);
    });
});
