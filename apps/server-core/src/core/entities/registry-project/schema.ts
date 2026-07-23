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
    fields: {
        default: ['id', 'name', 'type', 'public', 'external_name', 'external_id', 'account_id', 'account_name', 'webhook_name', 'webhook_exists', 'registry_id', 'realm_id', 'created_at', 'updated_at'],
        allowed: ['id', 'name', 'type', 'public', 'external_name', 'external_id', 'account_id', 'account_name', 'webhook_name', 'webhook_exists', 'registry_id', 'realm_id', 'created_at', 'updated_at', 'account_secret'],
    },
    filters: { allowed: ['id', 'name', 'registry_id', 'external_name', 'type'] },
    relations: { allowed: ['registry'] },
    sort: { allowed: ['id', 'updated_at', 'created_at'] },
    pagination: { maxLimit: 50 },
    schemaMapping,
});
