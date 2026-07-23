/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { Project } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';

const schemaMapping = { master_image: DomainType.MASTER_IMAGE };

export const projectSchema = defineSchema<Project>({
    name: DomainType.PROJECT,
    strict: true,
    fields: {
        default: ['id', 'name', 'display_name', 'description', 'nodes', 'analyses', 'created_at', 'updated_at', 'realm_id', 'client_id', 'robot_id', 'user_id', 'master_image_id'],
        allowed: ['id', 'name', 'display_name', 'description', 'nodes', 'analyses', 'created_at', 'updated_at', 'realm_id', 'client_id', 'robot_id', 'user_id', 'master_image_id'],
    },
    filters: { allowed: ['id', 'name', 'display_name', 'realm_id', 'user_id'] },
    relations: { allowed: ['master_image'] },
    sort: { allowed: ['id', 'updated_at', 'created_at'] },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
