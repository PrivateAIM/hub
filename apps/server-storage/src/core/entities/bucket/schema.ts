/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { Bucket } from '@privateaim/storage-kit';
import { DomainType } from '@privateaim/storage-kit';

// Every sequence is a leftmost prefix of a real entity structure (the PK, or a
// single-column @Index on BucketEntity), and every filter/sort allow-list key
// LEADS one — the invariant the `indexed` policies below rest on (issue #1842).
// `createdAt`/`updatedAt` are sortable but deliberately NOT filterable: they sit
// behind `dateToISOStringTransformer`, which applies on read but not to WHERE
// binds, so equality/ranges would silently mismatch (authup#3429).
export const bucketSchema = defineSchema<Bucket>({
    name: DomainType.BUCKET,
    strict: true,
    indexes: [
        ['id'],
        ['name'],
        ['realmId'],
        ['actorType'],
        ['actorId'],
        ['createdAt'],
        ['updatedAt'],
    ],
    fields: { default: ['id', 'name', 'region', 'createdAt', 'updatedAt', 'realmId', 'actorId', 'actorType'] },
    filters: { allowed: ['id', 'name', 'realmId', 'actorType', 'actorId'], indexed: true },
    sorts: { allowed: ['id', 'updatedAt', 'createdAt'], indexed: true },
    pagination: { maxLimit: 50 },
});
