/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNode } from '@privateaim/core-kit';

export type AnalysisNodeExecutionState = 'done' | 'running' | 'waiting' | 'failed';

export type AnalysisNodeApprovalState = 'approved' | 'pending' | 'rejected';

export type AnalysisNodeStateCount<K extends string = string> = {
    key: K,
    count: number
};

export type AnalysisNodeLanePartition = {
    /**
     * Lanes to render. All nodes when the fleet fits the budget,
     * otherwise only the exception nodes.
     */
    lanes: AnalysisNode[],

    /**
     * Nodes on track that were collapsed behind the expander.
     */
    hidden: AnalysisNode[],

    /**
     * True when the fleet exceeded the budget and the section
     * should lead with the state distribution summary.
     */
    summarized: boolean
};
