/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import type { Event } from '../event';
import type { Node } from '../node';
import type { Analysis } from '../analysis';

export interface AnalysisNodeEvent {
    id: string;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    event_id: Event['id'];

    event: Event;

    analysis_id: Analysis['id'];

    analysis: Analysis;

    analysis_realm_id: Realm['id'];

    node_id: Node['id'];

    node: Node;

    node_realm_id: Realm['id'];
}
