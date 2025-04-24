/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum PermissionName {
    BUCKET_CREATE = 'bucket_create',
    BUCKET_UPDATE = 'bucket_update',
    BUCKET_DELETE = 'bucket_delete',

    PROJECT_CREATE = 'project_create',
    PROJECT_DELETE = 'project_delete',
    PROJECT_UPDATE = 'project_update',
    PROJECT_APPROVE = 'project_approve',

    REGISTRY_MANAGE = 'registry_manage',
    REGISTRY_PROJECT_MANAGE = 'registry_project_manage',

    NODE_CREATE = 'node_create',
    NODE_DELETE = 'node_delete',
    NODE_UPDATE = 'node_update',

    ANALYSIS_APPROVE = 'analysis_approve',
    ANALYSIS_UPDATE = 'analysis_update',
    ANALYSIS_CREATE = 'analysis_create',
    ANALYSIS_EXECUTION_START = 'analysis_execution_start',
    ANALYSIS_EXECUTION_STOP = 'analysis_execution_stop',
    ANALYSIS_DELETE = 'analysis_delete',
    ANALYSIS_RESULT_READ = 'analysis_result_read', // todo: this is maybe not required anymore

    ANALYSIS_SELF_MESSAGE_BROKER_USE = 'analysis_self_message_broker_use',
    ANALYSIS_SELF_STORAGE_USE = 'analysis_self_storage_use',

    MASTER_IMAGE_MANAGE = 'master_image_manage',
    MASTER_IMAGE_GROUP_MANAGE = 'master_image_group_manage',

    SERVICE_MANAGE = 'service_manage',
}
