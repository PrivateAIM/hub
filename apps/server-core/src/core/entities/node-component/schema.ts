/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { NodeComponent } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';

const schemaMapping = { node: DomainType.NODE };

const fields: (keyof NodeComponent)[] = [
    'id',
    'nodeId',
    'name',
    'version',
    'status',
    'message',
    'latency',
    'uptime',
    'checksTotal',
    'checksSuccessful',
    'reportedAt',
    'createdAt',
    'updatedAt',
];

export const nodeComponentSchema = defineSchema<NodeComponent>({
    name: DomainType.NODE_COMPONENT,
    strict: true,
    // `nodeId` anchors through the UNIQUE(nodeId, name) it leads. `reportedAt`
    // is neither filterable nor sortable: it sits behind a transformer.
    indexes: [
        ['id'],
        ['nodeId', 'name'],
        ['name', 'version'],
        ['version'],
        ['status'],
        ['createdAt'],
        ['updatedAt'],
    ],
    fields: {
        default: fields,
        allowed: fields,
    },
    filters: { allowed: ['id', 'nodeId', 'name', 'version', 'status'], indexed: true },
    relations: { allowed: ['node'] },
    sorts: { allowed: ['name', 'version', 'updatedAt', 'createdAt'], indexed: true },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
