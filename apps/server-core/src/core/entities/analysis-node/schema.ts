/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import { DomainType } from '@privateaim/core-kit';

const schemaMapping = {
    node: DomainType.NODE,
    analysis: DomainType.ANALYSIS,
};

export const analysisNodeSchema = defineSchema({
    name: DomainType.ANALYSIS_NODE,
    strict: true,
    filters: { allowed: ['execution_status', 'approval_status', 'analysis_id', 'analysis_realm_id', 'analysis.id', 'analysis.name', 'analysis.display_name', 'analysis.project_id', 'node_id', 'node_realm_id', 'node.name', 'node.realm_id'] },
    relations: { allowed: ['node', 'analysis'] },
    sort: { allowed: ['created_at', 'updated_at', 'analysis.name', 'analysis.display_name', 'analysis.created_at', 'analysis.updated_at', 'node.name', 'node.created_at', 'node.updated_at'] },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
