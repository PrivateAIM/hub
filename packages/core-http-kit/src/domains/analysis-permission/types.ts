/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisPermission } from '@privateaim/core-kit';

export type AnalysisPermissionCreatePayload =    & Pick<AnalysisPermission, 'permission_id' | 'analysis_id'> &
    Partial<Pick<AnalysisPermission, 'policy_id'>>;
