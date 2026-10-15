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
    // Each node/project id and realm leads a composite paired with the
    // opposite side, so a filter combination from either side is backed by
    // one index; the status composite backs `sort=approvalStatus,-createdAt`.
    indexes: [
        ['projectId', 'nodeId'],
        ['projectId', 'nodeRealmId'],
        ['nodeId', 'projectRealmId'],
        ['projectRealmId', 'nodeId'],
        ['nodeRealmId', 'projectId'],
        ['approvalStatus', 'createdAt'],
        ['createdAt'],
        ['updatedAt'],
    ],
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
    filters: {
        allowed: ['approvalStatus', 'projectRealmId', 'projectId', 'nodeRealmId', 'nodeId'],
        indexed: true,
    },
    relations: { allowed: ['node', 'project'] },
    sorts: {
        allowed: ['approvalStatus', 'createdAt', 'updatedAt'],
        indexed: true,
    },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
