/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { MasterImageGroup } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';

export const masterImageGroupSchema = defineSchema<MasterImageGroup>({
    name: DomainType.MASTER_IMAGE_GROUP,
    strict: true,
    indexes: [
        ['id'],
        ['name'],
        ['path'],
        ['virtualPath'],
        ['createdAt'],
        ['updatedAt'],
    ],
    fields: {
        default: [
            'id',
            'name',
            'path',
            'virtualPath',
            'createdAt',
            'updatedAt',
        ],
    },
    filters: { allowed: ['id', 'name', 'path', 'virtualPath'], indexed: true },
    // Previously no sorts were declared at all, which under `strict` rejected
    // every requested sort key — the explicit list mirrors masterImage's
    // sortable surface, every entry backed by an index.
    sorts: {
        allowed: ['name', 'path', 'virtualPath', 'createdAt', 'updatedAt'],
        indexed: true,
    },
    pagination: { maxLimit: 50 },
});
