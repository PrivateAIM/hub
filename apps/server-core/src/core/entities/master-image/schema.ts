/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { MasterImage } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';

export const masterImageSchema = defineSchema<MasterImage>({
    name: DomainType.MASTER_IMAGE,
    strict: true,
    indexes: [
        ['id'],
        ['name'],
        ['path'],
        ['virtualPath'],
        ['groupVirtualPath'],
        ['createdAt'],
        ['updatedAt'],
    ],
    // Explicit root projection governing the master-image list/detail response
    // shape. `include=masterImage` (analysis/project) hydrates the relation as a
    // full subtree regardless (rapiq beta.8). `commandArguments` is a json column,
    // projectable since rapiq beta.8 (tada5hi/rapiq#824).
    fields: {
        default: [
            'id',
            'name',
            'path',
            'virtualPath',
            'groupVirtualPath',
            'command',
            'commandArguments',
            'buildStatus',
            'buildProgress',
            'buildHash',
            'buildSize',
            'createdAt',
            'updatedAt',
        ],
    },
    filters: { allowed: ['id', 'name', 'path', 'virtualPath', 'groupVirtualPath'], indexed: true },
    // The allow-list was previously derived from the default (`['path']` only),
    // which silently ignored the `virtualPath` sort client-vue's FMasterImages
    // has been requesting all along — the explicit list makes it bind.
    sorts: {
        allowed: ['name', 'path', 'virtualPath', 'createdAt', 'updatedAt'],
        default: { path: 'ASC' },
        indexed: true,
    },
    pagination: { maxLimit: 50 },
});
