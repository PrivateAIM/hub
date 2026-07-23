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
    filters: { allowed: ['id', 'name', 'path', 'virtual_path', 'group_virtual_path'] },
    sort: { default: { path: 'ASC' } },
    pagination: { maxLimit: 50 },
});
