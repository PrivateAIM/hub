/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core';
import type { DomainType } from '../constants';
import type { Project } from '../project';
import type { Node } from '../node';
import type { Analysis } from '../analysis';
import type { DomainEventBaseContext } from '../types-base';
import type { AnalysisNodeApprovalStatus, AnalysisNodeRunStatus } from './constants';

export interface TrainStation {
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

    train_id: Analysis['id'];

    train: Analysis;

    train_realm_id: Realm['id'];

    station_id: Node['id'];

    station: Node;

    station_realm_id: Realm['id'];
}

export type TrainStationEventContext = DomainEventBaseContext & {
    type: `${DomainType.TRAIN_STATION}`,
    data: TrainStation
};
