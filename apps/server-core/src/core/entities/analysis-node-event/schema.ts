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
    fields: {
        default: [
            'id',
            'eventId',
            'createdAt',
            'updatedAt',
            'analysisId',
            'analysisRealmId',
            'nodeId',
            'nodeRealmId',
        ],
    },
    filters: { allowed: ['analysisId', 'nodeId'] },
    relations: { allowed: ['analysis', 'node'] },
    sorts: { allowed: ['createdAt', 'updatedAt'] },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
