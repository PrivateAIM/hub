/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { ProjectNode } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';

const schemaMapping = {
    node: DomainType.NODE,
    project: DomainType.PROJECT,
};

export const projectNodeSchema = defineSchema<ProjectNode>({
    name: DomainType.PROJECT_NODE,
    strict: true,
    fields: {
        default: [
            'id',
            'approvalStatus',
            'comment',
            'createdAt',
            'updatedAt',
            'projectId',
            'projectRealmId',
            'nodeId',
            'nodeRealmId',
        ],
    },
    filters: { allowed: ['projectRealmId', 'projectId', 'nodeRealmId', 'nodeId'] },
    relations: { allowed: ['node', 'project'] },
    sort: { allowed: ['createdAt', 'updatedAt'] },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
