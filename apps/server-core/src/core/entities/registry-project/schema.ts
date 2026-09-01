/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { RegistryProject } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';

const schemaMapping = { registry: DomainType.REGISTRY };

export const registryProjectSchema = defineSchema<RegistryProject>({
    name: DomainType.REGISTRY_PROJECT,
    strict: true,
    // `name` and `externalName` anchor through the uniques they lead;
    // `registryId` sits in their non-leading positions and needs its own
    // single. The UNIQUE(externalId, registryId) is deliberately not declared:
    // `externalId` is not queryable.
    indexes: [
        ['id'],
        ['name', 'registryId'],
        ['externalName', 'registryId'],
        ['registryId'],
        ['type'],
        ['createdAt'],
        ['updatedAt'],
    ],
    fields: {
        default: ['id', 'name', 'type', 'public', 'externalName', 'externalId', 'accountId', 'accountName', 'webhookName', 'webhookExists', 'registryId', 'realmId', 'createdAt', 'updatedAt'],
        allowed: ['id', 'name', 'type', 'public', 'externalName', 'externalId', 'accountId', 'accountName', 'webhookName', 'webhookExists', 'registryId', 'realmId', 'createdAt', 'updatedAt', 'accountSecret'],
    },
    filters: { allowed: ['id', 'name', 'registryId', 'externalName', 'type'], indexed: true },
    relations: { allowed: ['registry'] },
    sorts: { allowed: ['id', 'updatedAt', 'createdAt'], indexed: true },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
