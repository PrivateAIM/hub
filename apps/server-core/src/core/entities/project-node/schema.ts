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
    fields: {
        default: [
            'id',
            'approval_status',
            'comment',
            'created_at',
            'updated_at',
            'project_id',
            'project_realm_id',
            'node_id',
            'node_realm_id',
        ],
    },
    filters: { allowed: ['project_realm_id', 'project_id', 'node_realm_id', 'node_id'] },
    relations: { allowed: ['node', 'project'] },
    sort: { allowed: ['created_at', 'updated_at'] },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
