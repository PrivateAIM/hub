/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisNode } from '@privateaim/core-kit';
import type { IEntityAPI } from '../types-base';

export type AnalysisNodeCreatePayload =    & Pick<AnalysisNode, 'nodeId' | 'analysisId'> &
    Partial<Pick<AnalysisNode, 'executionStatus' | 'executionProgress' | 'approvalStatus' | 'comment'>>;

export type AnalysisNodeUpdatePayload = Partial<AnalysisNodeCreatePayload>;

export interface IAnalysisNodeAPI extends IEntityAPI<AnalysisNode, AnalysisNodeCreatePayload, AnalysisNodeUpdatePayload> {}
