/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import type { Event } from '@privateaim/telemetry-kit';
import type { Node } from '../node';
import type { Analysis } from '../analysis';

export interface AnalysisNodeEvent {
    id: string;

    // ------------------------------------------------------------------

    createdAt: string;

    updatedAt: string;

    // ------------------------------------------------------------------

    eventId: Event['id'];

    analysisId: Analysis['id'];

    analysis: Analysis;

    analysisRealmId: Realm['id'];

    nodeId: Node['id'];

    node: Node;

    nodeRealmId: Realm['id'];
}
