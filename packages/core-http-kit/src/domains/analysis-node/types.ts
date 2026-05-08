/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNode } from '@privateaim/core-kit';

export type AnalysisNodeCreatePayload =    & Pick<AnalysisNode, 'node_id' | 'analysis_id'> &
    Partial<Pick<AnalysisNode, 'execution_status' | 'execution_progress' | 'approval_status' | 'comment'>>;

export type AnalysisNodeUpdatePayload = Partial<AnalysisNodeCreatePayload>;
