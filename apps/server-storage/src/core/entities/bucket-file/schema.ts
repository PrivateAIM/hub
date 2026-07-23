/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { BucketFile } from '@privateaim/storage-kit';
import { DomainType } from '@privateaim/storage-kit';

const schemaMapping = { bucket: DomainType.BUCKET };

export const bucketFileSchema = defineSchema<BucketFile>({
    name: DomainType.BUCKET_FILE,
    strict: true,
    fields: { default: ['id', 'name', 'path', 'directory', 'size', 'hash', 'created_at', 'updated_at', 'realm_id', 'actor_type', 'actor_id', 'bucket_id'] },
    filters: { allowed: ['id', 'name', 'directory', 'realm_id', 'actor_type', 'actor_id', 'bucket_id'] },
    relations: { allowed: ['bucket'] },
    sort: { allowed: ['id', 'directory', 'name', 'updated_at', 'created_at'] },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
