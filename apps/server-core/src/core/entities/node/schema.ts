/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { Node } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';

const schemaMapping = {
    registry_project: DomainType.REGISTRY_PROJECT,
    registry: DomainType.REGISTRY,
};

export const nodeSchema = defineSchema<Node>({
    name: DomainType.NODE,
    strict: true,
    fields: {
        default: ['id', 'name', 'client_id', 'external_name', 'hidden', 'type', 'online', 'public_key', 'robot_id', 'realm_id', 'registry_id', 'registry_project_id', 'created_at', 'updated_at'],
        allowed: ['id', 'name', 'client_id', 'external_name', 'hidden', 'type', 'online', 'public_key', 'robot_id', 'realm_id', 'registry_id', 'registry_project_id', 'created_at', 'updated_at'],
    },
    filters: { allowed: ['id', 'name', 'online', 'hidden', 'client_id', 'realm_id', 'robot_id'] },
    relations: { allowed: ['registry_project', 'registry'] },
    sort: { allowed: ['name', 'updated_at', 'created_at'] },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
