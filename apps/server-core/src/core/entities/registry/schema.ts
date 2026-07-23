/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { Registry } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';

export const registrySchema = defineSchema<Registry>({
    name: DomainType.REGISTRY,
    strict: true,
    fields: {
        default: ['id', 'name', 'host', 'account_name', 'created_at', 'updated_at'],
        allowed: ['id', 'name', 'host', 'account_name', 'created_at', 'updated_at', 'account_secret'],
    },
    filters: { allowed: ['id', 'name'] },
    sort: { allowed: ['id', 'updated_at', 'created_at'] },
    pagination: { maxLimit: 50 },
});
