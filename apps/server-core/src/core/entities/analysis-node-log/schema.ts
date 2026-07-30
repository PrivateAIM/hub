/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineSchema } from '@rapiq/core';
import type { AnalysisNodeLog } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';

export const analysisNodeLogSchema = defineSchema<AnalysisNodeLog>({
    name: DomainType.ANALYSIS_NODE_LOG,
    strict: true,
    filters: { allowed: ['level', 'analysisId', 'nodeId'] },
    sort: { allowed: ['time'] },
    pagination: { maxLimit: 50 },
});
