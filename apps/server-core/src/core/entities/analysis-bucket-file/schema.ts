/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import { DomainType } from '@privateaim/core-kit';

const schemaMapping = {
    analysis: DomainType.ANALYSIS,
    analysis_bucket: DomainType.ANALYSIS_BUCKET,
};

export const analysisBucketFileSchema = defineSchema({
    name: DomainType.ANALYSIS_BUCKET_FILE,
    strict: true,
    fields: {
        default: ['id', 'path', 'root', 'bucket_id', 'bucket_file_id', 'client_id', 'robot_id', 'user_id', 'realm_id', 'analysis_id', 'analysis_bucket_id', 'created_at', 'updated_at'],
        allowed: ['id', 'path', 'root', 'bucket_id', 'bucket_file_id', 'client_id', 'robot_id', 'user_id', 'realm_id', 'analysis_id', 'analysis_bucket_id', 'created_at', 'updated_at'],
    },
    filters: { allowed: ['path', 'root', 'analysis_bucket_id', 'analysis_id', 'analysis.id', 'analysis.name', 'analysis.display_name', 'analysis_bucket.type'] },
    relations: { allowed: ['analysis', 'analysis_bucket'] },
    sort: { allowed: ['path', 'created_at', 'updated_at'] },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
