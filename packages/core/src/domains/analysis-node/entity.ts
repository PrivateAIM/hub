/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import type { DomainType } from '../constants';
import type { Node } from '../node';
import type { Analysis } from '../analysis';
import type { DomainEventBaseContext } from '../types-base';
import type { AnalysisNodeApprovalStatus, AnalysisNodeRunStatus } from './constants';

export interface AnalysisNode {
    id: string;

    // ------------------------------------------------------------------

    approval_status: AnalysisNodeApprovalStatus | null;

    run_status: AnalysisNodeRunStatus | null;

    // ------------------------------------------------------------------

    comment: string;

    index: number;

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

export type TrainStationEventContext = DomainEventBaseContext & {
    type: `${DomainType.ANALYSIS_NODE}`,
    data: AnalysisNode
};

export type AnalyseNodeSocketEventData = Record<string, { online: boolean, realmId: string }>;
export type AnalyseNodeSocketCTSEvents = {
    analysisNodes: (id: Analysis['id'], cb?: (err: null | Error, data: AnalyseNodeSocketEventData) => void) => void
};
