/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName } from '@privateaim/kit';

/** Holding any analysis write or lifecycle permission implies read. */
export const ANALYSIS_READ_PERMISSIONS = [
    PermissionName.ANALYSIS_READ,
    PermissionName.ANALYSIS_CREATE,
    PermissionName.ANALYSIS_UPDATE,
    PermissionName.ANALYSIS_DELETE,
    PermissionName.ANALYSIS_APPROVE,
    PermissionName.ANALYSIS_EXECUTION_START,
    PermissionName.ANALYSIS_EXECUTION_STOP,
];
