/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import type { ProcessStatus } from '@privateaim/kit';
import type { Node } from '../node';
import type { Analysis } from '../analysis';
import type { AnalysisNodeApprovalStatus } from './constants';

export interface AnalysisNode {
    id: string;

    // ------------------------------------------------------------------

    approvalStatus: AnalysisNodeApprovalStatus | null;

    // ------------------------------------------------------------------

    executionStatus: ProcessStatus | null;

    executionProgress: number | null;

    // ------------------------------------------------------------------

    comment: string;

    // ------------------------------------------------------------------

    artifactTag: string | null;

    artifactDigest: string | null;

    // ------------------------------------------------------------------

    createdAt: string;

    updatedAt: string;

    // ------------------------------------------------------------------

    analysisId: Analysis['id'];

    analysis: Analysis;

    analysisRealmId: Realm['id'];

    nodeId: Node['id'];

    node: Node;

    nodeRealmId: Realm['id'];
}
