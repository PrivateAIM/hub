/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { Project } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';

const schemaMapping = { masterImage: DomainType.MASTER_IMAGE };

export const projectSchema = defineSchema<Project>({
    name: DomainType.PROJECT,
    strict: true,
    fields: {
        default: ['id', 'name', 'displayName', 'description', 'nodes', 'analyses', 'createdAt', 'updatedAt', 'realmId', 'clientId', 'robotId', 'userId', 'masterImageId'],
        allowed: ['id', 'name', 'displayName', 'description', 'nodes', 'analyses', 'createdAt', 'updatedAt', 'realmId', 'clientId', 'robotId', 'userId', 'masterImageId'],
    },
    filters: { allowed: ['id', 'name', 'displayName', 'realmId', 'userId'] },
    relations: { allowed: ['masterImage'] },
    sorts: { allowed: ['id', 'name', 'displayName', 'updatedAt', 'createdAt'] },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
