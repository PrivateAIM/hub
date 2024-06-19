/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName as AuthPermissionName } from '@authup/core-kit';

export enum PermissionKey {
    BUCKET_ADD = 'bucket_add',
    BUCKET_EDIT = 'bucket_edit',
    BUCKET_DROP = 'bucket_drop',

    PROJECT_ADD = 'project_add',
    PROJECT_DROP = 'project_drop',
    PROJECT_EDIT = 'project_edit',
    PROJECT_APPROVE = 'project_approve',

    REGISTRY_MANAGE = 'registry_manage',
    REGISTRY_PROJECT_MANAGE = 'registry_project_manage',

    NODE_ADD = 'node_add',
    NODE_DROP = 'node_drop',
    NODE_EDIT = 'node_edit',

    ANALYSIS_APPROVE = 'analysis_approve',
    ANALYSIS_EDIT = 'analysis_edit',
    ANALYSIS_ADD = 'analysis_add',
    ANALYSIS_EXECUTION_START = 'analysis_execution_start',
    ANALYSIS_EXECUTION_STOP = 'analysis_execution_stop',
    ANALYSIS_DROP = 'analysis_drop',
    ANALYSIS_RESULT_READ = 'analysis_result_read', // todo: this is maybe not required anymore

    MASTER_IMAGE_MANAGE = 'master_image_manage',
    MASTER_IMAGE_GROUP_MANAGE = 'master_image_group_manage',

    SERVICE_MANAGE = 'service_manage',
}

export const PermissionID = {
    ...PermissionKey,
    ...AuthPermissionName,
};

export type PermissionIDType = typeof PermissionID[keyof typeof PermissionID];
