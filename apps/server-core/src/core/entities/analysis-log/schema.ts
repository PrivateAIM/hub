/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import { DomainType } from '@privateaim/core-kit';

export const analysisLogSchema = defineSchema({
    name: DomainType.ANALYSIS_LOG,
    strict: true,
    filters: { allowed: ['level', 'analysis_id'] },
    sort: { allowed: ['time'] },
    pagination: { maxLimit: 50 },
});
