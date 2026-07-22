/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { AnalysisNodeEvent } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';

const schemaMapping = {
    analysis: DomainType.ANALYSIS,
    node: DomainType.NODE,
};

export const analysisNodeEventSchema = defineSchema<AnalysisNodeEvent>({
    name: DomainType.ANALYSIS_NODE_EVENT,
    strict: true,
    filters: { allowed: ['analysis_id', 'node_id'] },
    relations: { allowed: ['analysis', 'node'] },
    sort: { allowed: ['created_at', 'updated_at'] },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
