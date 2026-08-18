/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { Event } from '@privateaim/telemetry-kit';
import { DomainType } from '@privateaim/telemetry-kit';

export const eventSchema = defineSchema<Event>({
    name: DomainType.EVENT,
    strict: true,
    filters: { allowed: ['scope', 'name', 'refType', 'refId', 'realmId', 'createdAt', 'updatedAt'] },
    sorts: { allowed: ['expiresAt', 'createdAt', 'updatedAt'] },
    pagination: { maxLimit: 50 },
});
