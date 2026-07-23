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
    // Explicit root projection: without it the relation is joined but no columns
    // are selected, so `include=master_image` (analysis/project) never hydrates it.
    // `command_arguments` is a json/array column and cannot be listed here
    // (rapiq SimpleKeys excludes array keys, tada5hi/rapiq#824) — it stays available
    // via the master-image getOne endpoint (raw findOneById, no projection).
    fields: {
        default: [
            'id',
            'name',
            'path',
            'virtual_path',
            'group_virtual_path',
            'command',
            'build_status',
            'build_progress',
            'build_hash',
            'build_size',
            'created_at',
            'updated_at',
        ],
    },
    filters: { allowed: ['id', 'name', 'path', 'virtual_path', 'group_virtual_path'] },
    sort: { default: { path: 'ASC' } },
    pagination: { maxLimit: 50 },
});
