/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PermissionRelation, Realm } from '@authup/core-kit';
import type { DomainType } from '../constants';
import type { DomainEventBaseContext } from '../types-base';

export interface AnalysisPermission extends PermissionRelation {
    id: string;

    // ------------------------------------------------------------------

    analysis_realm: Realm | null;

    analysis_realm_id: Realm['id'] | null;

    // ------------------------------------------------------------------

    created_at: Date | string;

    updated_at: Date | string;
}

export type AnalysisPermissionEventContext = DomainEventBaseContext & {
    type: `${DomainType.ANALYSIS_PERMISSION}`,
    data: AnalysisPermission
};
