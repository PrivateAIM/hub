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
    fields: { default: ['id', 'name', 'region', 'createdAt', 'updatedAt', 'realmId', 'actorId', 'actorType'] },
    filters: { allowed: ['id', 'name', 'realmId', 'actorType', 'actorId'] },
    sort: { allowed: ['id', 'updatedAt', 'createdAt'] },
    pagination: { maxLimit: 50 },
});
