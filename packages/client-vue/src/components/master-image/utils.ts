/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { MasterImage } from '@privateaim/core-kit';
import { ProcessStatus } from '@privateaim/kit';
import type { FiltersBuildInput } from '@rapiq/core';
import { MasterImageStatusFilter } from './constants';

/**
 * The `buildStatus` filter for one status bucket, or `undefined` for "all".
 * Building covers both states a build passes through before it finishes
 * (STARTING: dispatched, STARTED: the worker picked it up).
 */
export function buildMasterImageStatusFilters(
    filter: `${MasterImageStatusFilter}`,
): FiltersBuildInput<MasterImage, 3> | undefined {
    switch (filter) {
        case MasterImageStatusFilter.BUILT:
            return { buildStatus: ProcessStatus.EXECUTED };
        case MasterImageStatusFilter.BUILDING:
            return { buildStatus: [ProcessStatus.STARTING, ProcessStatus.STARTED] };
        case MasterImageStatusFilter.FAILED:
            return { buildStatus: ProcessStatus.FAILED };
        default:
            return undefined;
    }
}
