/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PermissionIDType } from '@privateaim/core';
import { PermissionID } from '@privateaim/core';

export enum PresetRoleName {
    STATION_AUTHORITY = 'StationAuthority',
    STATION_EMPLOYEE = 'StationEmployee',
}

export function getPresetRolePermissions(type: string) : PermissionIDType[] {
    const map : Record<string, PermissionIDType[]> = {
        [PresetRoleName.STATION_EMPLOYEE]: [
            PermissionID.PROJECT_ADD,
            PermissionID.PROJECT_DROP,
            PermissionID.PROJECT_EDIT,

            PermissionID.ANALYSIS_ADD,
            PermissionID.ANALYSIS_EDIT,
            PermissionID.ANALYSIS_EXECUTION_START,
            PermissionID.ANALYSIS_EXECUTION_STOP,
            PermissionID.ANALYSIS_RESULT_READ,
        ],
        [PresetRoleName.STATION_AUTHORITY]: [
            PermissionID.ADMIN_UI_USE,

            PermissionID.ROBOT_ADD,
            PermissionID.ROBOT_DROP,
            PermissionID.ROBOT_EDIT,

            PermissionID.PROJECT_ADD,
            PermissionID.PROJECT_DROP,
            PermissionID.PROJECT_EDIT,
            PermissionID.PROPOSAL_APPROVE,

            PermissionID.NODE_ADD,
            PermissionID.NODE_DROP,
            PermissionID.NODE_EDIT,

            PermissionID.PROVIDER_ADD,
            PermissionID.PROVIDER_DROP,
            PermissionID.PROVIDER_EDIT,

            PermissionID.REGISTRY_PROJECT_MANAGE,

            PermissionID.ANALYSIS_ADD,
            PermissionID.ANALYSIS_DROP,
            PermissionID.ANALYSIS_EDIT,
            PermissionID.ANALYSIS_APPROVE,
            PermissionID.ANALYSIS_EXECUTION_START,
            PermissionID.ANALYSIS_EXECUTION_STOP,
            PermissionID.ANALYSIS_RESULT_READ,

            PermissionID.USER_ADD,
            PermissionID.USER_EDIT,
            PermissionID.USER_DROP,
        ],
    };

    return map[type] || [];
}
