/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import { DomainType } from '@privateaim/core-kit';

const schemaMapping = { analysis: DomainType.ANALYSIS };

export const analysisBucketSchema = defineSchema({
    name: DomainType.ANALYSIS_BUCKET,
    strict: true,
    fields: {
        default: ['id', 'type', 'bucket_id', 'analysis_id', 'realm_id', 'created_at', 'updated_at'],
        allowed: ['id', 'type', 'bucket_id', 'analysis_id', 'realm_id', 'created_at', 'updated_at'],
    },
    filters: { allowed: ['analysis_id', 'type', 'analysis.id', 'analysis.name', 'analysis.display_name'] },
    relations: { allowed: ['analysis'] },
    sort: { allowed: ['type', 'created_at', 'updated_at'] },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
