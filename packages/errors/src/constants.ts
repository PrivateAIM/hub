/*
 * Copyright (c) 2022-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum ErrorCode {
    // Generic
    BAD_REQUEST = 'bad_request',
    INTERNAL_ERROR = 'internal_error',

    // Identity Auth
    IDENTITY_UNAUTHORIZED = 'identity_unauthorized',

    // Entity Codes
    ENTITY_NOT_FOUND = 'entity_not_found',
    ENTITY_CONFLICT = 'entity_conflict',
    ENTITY_RELATION_INVALID = 'entity_relation_invalid',

    // Permission Codes
    PERMISSION_DENIED = 'permission_denied',

    // Storage Codes
    STORAGE_INSUFFICIENT = 'storage_insufficient',

    // Analysis flow (hub-specific)
    ANALYSIS_REGISTRY_UNCONFIGURED = 'analysis_registry_unconfigured',
    ANALYSIS_NODE_REGISTRY_UNASSIGNED = 'analysis_node_registry_unassigned',
}
