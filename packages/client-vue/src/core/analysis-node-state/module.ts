/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNode } from '@privateaim/core-kit';
import { AnalysisNodeApprovalStatus } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type {
    AnalysisNodeApprovalState,
    AnalysisNodeExecutionState,
    AnalysisNodeLanePartition,
    AnalysisNodeStateCount,
} from './types';

/**
 * Above this many nodes, the card stops rendering one lane per node and
 * leads with the state distribution + exception lanes instead.
 */
export const ANALYSIS_NODE_LANE_BUDGET = 6;

export function resolveAnalysisNodeExecutionState(
    entity: Pick<AnalysisNode, 'executionStatus'>,
) : AnalysisNodeExecutionState {
    switch (entity.executionStatus) {
        case ProcessStatus.EXECUTED:
            return 'done';
        case ProcessStatus.FAILED:
            return 'failed';
        case ProcessStatus.STARTING:
        case ProcessStatus.STARTED:
        case ProcessStatus.EXECUTING:
        case ProcessStatus.STOPPING:
            return 'running';
        default:
            return 'waiting';
    }
}

export function resolveAnalysisNodeApprovalState(
    entity: Pick<AnalysisNode, 'approvalStatus'>,
) : AnalysisNodeApprovalState {
    switch (entity.approvalStatus) {
        case AnalysisNodeApprovalStatus.APPROVED:
            return 'approved';
        case AnalysisNodeApprovalStatus.REJECTED:
            return 'rejected';
        default:
            return 'pending';
    }
}

/**
 * A node needs attention when its approval is not settled positively
 * or its execution failed.
 */
export function isAnalysisNodeException(
    entity: Pick<AnalysisNode, 'approvalStatus' | 'executionStatus'>,
) : boolean {
    return resolveAnalysisNodeApprovalState(entity) !== 'approved' ||
        resolveAnalysisNodeExecutionState(entity) === 'failed';
}

export function partitionAnalysisNodeLanes(
    nodes: AnalysisNode[],
    budget: number = ANALYSIS_NODE_LANE_BUDGET,
) : AnalysisNodeLanePartition {
    if (nodes.length <= budget) {
        return {
            lanes: nodes, 
            hidden: [], 
            summarized: false, 
        };
    }

    const lanes : AnalysisNode[] = [];
    const hidden : AnalysisNode[] = [];

    // Exceptions lead, but the budget still bounds the card: a fleet whose
    // nodes are ALL unsettled (fresh distribution — every approval pending)
    // would otherwise render every lane and defeat the summarization.
    for (const node of nodes) {
        if (isAnalysisNodeException(node) && lanes.length < budget) {
            lanes.push(node);
        } else {
            hidden.push(node);
        }
    }

    return {
        lanes, 
        hidden, 
        summarized: true, 
    };
}

function countBy<K extends string>(
    nodes: AnalysisNode[],
    resolve: (node: AnalysisNode) => K,
    order: K[],
) : AnalysisNodeStateCount<K>[] {
    const counts = new Map<K, number>();
    for (const node of nodes) {
        const key = resolve(node);
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const output : AnalysisNodeStateCount<K>[] = [];
    for (const element of order) {
        const count = counts.get(element);
        if (count) {
            output.push({ key: element, count });
        }
    }

    return output;
}

export function buildAnalysisNodeApprovalDistribution(
    nodes: AnalysisNode[],
) : AnalysisNodeStateCount<AnalysisNodeApprovalState>[] {
    return countBy(nodes, resolveAnalysisNodeApprovalState, ['approved', 'pending', 'rejected']);
}

export function buildAnalysisNodeExecutionDistribution(
    nodes: AnalysisNode[],
) : AnalysisNodeStateCount<AnalysisNodeExecutionState>[] {
    return countBy(nodes, resolveAnalysisNodeExecutionState, ['done', 'running', 'waiting', 'failed']);
}
