/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis, AnalysisNode, Node } from '@privateaim/core-kit';
import { AnalysisNodeApprovalStatus, NodeType } from '@privateaim/core-kit';

export function createTestAnalysisNode(overrides?: Partial<AnalysisNode>): AnalysisNode {
    return {
        id: 'analysis-node-1',
        approval_status: AnalysisNodeApprovalStatus.APPROVED,
        execution_status: null,
        execution_progress: null,
        comment: '',
        artifact_tag: null,
        artifact_digest: null,
        created_at: new Date(),
        updated_at: new Date(),
        analysis_id: 'analysis-1',
        analysis: {} as Analysis,
        analysis_realm_id: 'realm-1',
        node_id: 'node-1',
        node: {
            id: 'node-1',
            name: 'node-1',
            type: NodeType.DEFAULT,
            registry_id: 'registry-1',
        } as Node,
        node_realm_id: 'realm-1',
        ...overrides,
    };
}
