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

    approval_status: AnalysisNodeApprovalStatus | null;

    // ------------------------------------------------------------------

    execution_status: ProcessStatus | null;

    // ------------------------------------------------------------------

    comment: string;

    // ------------------------------------------------------------------

    artifact_tag: string | null;

    artifact_digest: string | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    analysis_id: Analysis['id'];

    analysis: Analysis;

    analysis_realm_id: Realm['id'];

    node_id: Node['id'];

    node: Node;

    node_realm_id: Realm['id'];
}
