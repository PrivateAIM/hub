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
        approvalStatus: AnalysisNodeApprovalStatus.APPROVED,
        executionStatus: null,
        executionProgress: null,
        comment: '',
        artifactTag: null,
        artifactDigest: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        analysisId: 'analysis-1',
        analysis: {} as Analysis,
        analysisRealmId: 'realm-1',
        nodeId: 'node-1',
        node: {
            id: 'node-1',
            name: 'node-1',
            type: NodeType.DEFAULT,
            registryId: 'registry-1',
        } as Node,
        nodeRealmId: 'realm-1',
        ...overrides,
    };
}
