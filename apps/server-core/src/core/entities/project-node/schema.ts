/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import { DomainType } from '@privateaim/core-kit';

const schemaMapping = {
    node: DomainType.NODE,
    project: DomainType.PROJECT,
};

export const projectNodeSchema = defineSchema({
    name: DomainType.PROJECT_NODE,
    strict: true,
    filters: { allowed: ['project_realm_id', 'project_id', 'project.id', 'project.name', 'project.display_name', 'node_realm_id', 'node_id', 'node.name'] },
    relations: { allowed: ['node', 'project'] },
    sort: { allowed: ['created_at', 'updated_at', 'project.name', 'project.display_name', 'project.created_at', 'project.updated_at', 'node.name', 'node.created_at', 'node.updated_at'] },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
