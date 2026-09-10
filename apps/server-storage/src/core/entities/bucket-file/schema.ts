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

// Every sequence is a leftmost prefix of a real entity structure and every
// filter/sort allow-list key LEADS one — the invariant the `indexed` policies
// below rest on (issue #1842). `bucketId` rides the leftmost prefix of
// UNIQUE(bucketId, path) rather than an index of its own; `path` is not
// queryable, so the composite's tail stays undeclared (the declaration
// describes the query surface, not the whole table). The rest are
// single-column @Index decorators on BucketFileEntity. `createdAt`/`updatedAt`
// are sortable but deliberately NOT filterable: they sit behind
// `dateToISOStringTransformer`, which applies on read but not to WHERE binds,
// so equality/ranges would silently mismatch (authup#3429).
export const bucketFileSchema = defineSchema<BucketFile>({
    name: DomainType.BUCKET_FILE,
    strict: true,
    indexes: [
        ['id'],
        ['name'],
        ['directory'],
        ['realmId'],
        ['actorType'],
        ['actorId'],
        ['bucketId'],
        ['createdAt'],
        ['updatedAt'],
    ],
    fields: { default: ['id', 'name', 'path', 'directory', 'size', 'hash', 'createdAt', 'updatedAt', 'realmId', 'actorType', 'actorId', 'bucketId'] },
    filters: { allowed: ['id', 'name', 'directory', 'realmId', 'actorType', 'actorId', 'bucketId'], indexed: true },
    relations: { allowed: ['bucket'] },
    sorts: { allowed: ['id', 'directory', 'name', 'updatedAt', 'createdAt'], indexed: true },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
