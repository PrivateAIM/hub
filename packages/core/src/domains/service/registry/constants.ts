/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum RegistryAPICommand {
    SETUP = 'setup',
    CLEANUP = 'cleanup',
    DELETE = 'delete',

    PROJECT_LINK = 'projectLink',
    PROJECT_UNLINK = 'projectUnlink',
}

/**
 * Incoming train project name
 */
export const REGISTRY_INCOMING_PROJECT_NAME = 'incoming';

/**
 * Outgoing train project name
 */
export const REGISTRY_OUTGOING_PROJECT_NAME = 'outgoing';

/**
 * Master Image project name
 */
export const REGISTRY_MASTER_IMAGE_PROJECT_NAME = 'master';

/**
 * Latest image tag
 */
export const REGISTRY_ARTIFACT_TAG_LATEST = 'latest';

/**
 * base image tag
 */
export const REGISTRY_ARTIFACT_TAG_BASE = 'base';
