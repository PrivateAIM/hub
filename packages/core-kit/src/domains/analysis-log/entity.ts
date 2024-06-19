/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm } from '@authup/core-kit';
import type { DomainType } from '../constants';
import type {
    Analysis,
} from '../analysis';
import type { DomainEventBaseContext } from '../types-base';

export interface AnalysisLog {
    id: string;

    /**
     * e.g: building, routing, ...
     */
    component: string | null;

    /**
     * e.g: process, check, stop, ...
     */
    command: string | null;

    /**
     * e.g checking, checked
     */
    event: string | null;

    /**
     * e.g: init, ...
     */
    step: string | null;

    error: boolean;

    /**
     * e.g: trainNotBuild, entrypointNotFound, ...
     */
    error_code: string | null;

    /**
     * e.g. started, finished, failed, ...
     */
    status: string | null;

    /**
     * e.g: error_message
     */
    status_message: string | null;

    /**
     * e.g: {station_id: xxx, station_index: 0}
     */
    meta: string | null;

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;

    // ------------------------------------------------------------------

    analysis_id: Analysis['id'];

    analysis: Analysis;

    realm_id: Realm['id'];
}

export type AnalysisLogEventContext = DomainEventBaseContext & {
    type: `${DomainType.ANALYSIS_LOG}`,
    data: AnalysisLog
};
