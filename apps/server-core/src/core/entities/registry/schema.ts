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
        default: ['id', 'name', 'host', 'accountName', 'createdAt', 'updatedAt'],
        allowed: ['id', 'name', 'host', 'accountName', 'createdAt', 'updatedAt', 'accountSecret'],
    },
    filters: { allowed: ['id', 'name'] },
    sorts: { allowed: ['id', 'updatedAt', 'createdAt'] },
    pagination: { maxLimit: 50 },
});
