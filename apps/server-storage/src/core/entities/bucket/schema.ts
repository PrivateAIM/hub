/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { Bucket } from '@privateaim/storage-kit';
import { DomainType } from '@privateaim/storage-kit';

export const bucketSchema = defineSchema<Bucket>({
    name: DomainType.BUCKET,
    strict: true,
    fields: { default: ['id', 'name', 'region', 'created_at', 'updated_at', 'realm_id', 'actor_id', 'actor_type'] },
    filters: { allowed: ['id', 'name', 'realm_id', 'actor_type', 'actor_id'] },
    sort: { allowed: ['id', 'updated_at', 'created_at'] },
    pagination: { maxLimit: 50 },
});
