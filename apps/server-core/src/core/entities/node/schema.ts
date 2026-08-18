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
    registryProject: DomainType.REGISTRY_PROJECT,
    registry: DomainType.REGISTRY,
};

export const nodeSchema = defineSchema<Node>({
    name: DomainType.NODE,
    strict: true,
    fields: {
        default: ['id', 'name', 'clientId', 'externalName', 'hidden', 'type', 'online', 'publicKey', 'robotId', 'realmId', 'registryId', 'registryProjectId', 'createdAt', 'updatedAt'],
        allowed: ['id', 'name', 'clientId', 'externalName', 'hidden', 'type', 'online', 'publicKey', 'robotId', 'realmId', 'registryId', 'registryProjectId', 'createdAt', 'updatedAt'],
    },
    filters: { allowed: ['id', 'name', 'online', 'hidden', 'clientId', 'realmId', 'robotId'] },
    relations: { allowed: ['registryProject', 'registry'] },
    sorts: { allowed: ['name', 'updatedAt', 'createdAt'] },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
