/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { AnalysisNode } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';

const schemaMapping = {
    node: DomainType.NODE,
    analysis: DomainType.ANALYSIS,
};

export const analysisNodeSchema = defineSchema<AnalysisNode>({
    name: DomainType.ANALYSIS_NODE,
    strict: true,
    // `nodeId` anchors through the UNIQUE(nodeId, analysisId) it leads;
    // `analysisId` sits in its non-leading position and needs its own single.
    indexes: [
        ['nodeId', 'analysisId'],
        ['analysisId'],
        ['approvalStatus'],
        ['executionStatus'],
        ['analysisRealmId'],
        ['nodeRealmId'],
        ['createdAt'],
        ['updatedAt'],
    ],
    fields: {
        default: [
            'id',
            'approvalStatus',
            'executionStatus',
            'executionProgress',
            'comment',
            'artifactTag',
            'artifactDigest',
            'createdAt',
            'updatedAt',
            'analysisId',
            'analysisRealmId',
            'nodeId',
            'nodeRealmId',
        ],
    },
    filters: {
        allowed: ['executionStatus', 'approvalStatus', 'analysisId', 'analysisRealmId', 'nodeId', 'nodeRealmId'],
        indexed: true,
    },
    relations: { allowed: ['node', 'analysis'] },
    sorts: { allowed: ['createdAt', 'updatedAt'], indexed: true },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
