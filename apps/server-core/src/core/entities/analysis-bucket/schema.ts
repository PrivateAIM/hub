/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { AnalysisBucket } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';

const schemaMapping = { analysis: DomainType.ANALYSIS };

export const analysisBucketSchema = defineSchema<AnalysisBucket>({
    name: DomainType.ANALYSIS_BUCKET,
    strict: true,
    fields: {
        default: ['id', 'type', 'bucketId', 'analysisId', 'realmId', 'createdAt', 'updatedAt'],
        allowed: ['id', 'type', 'bucketId', 'analysisId', 'realmId', 'createdAt', 'updatedAt'],
    },
    filters: { allowed: ['analysisId', 'type'] },
    relations: { allowed: ['analysis'] },
    sorts: { allowed: ['type', 'createdAt', 'updatedAt'] },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
