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
    fields: {
        default: [
            'id',
            'name',
            'path',
            'virtual_path',
            'created_at',
            'updated_at',
        ],
    },
    filters: { allowed: ['id', 'name', 'path', 'virtual_path'] },
    pagination: { maxLimit: 50 },
});
