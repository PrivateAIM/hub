/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { hasInstanceof } from '@ebec/core';
import { isHubError } from '../check.ts';
import { ErrorCode } from '../constants.ts';
import { BAD_REQUEST_ERROR_INSTANCE, type BadRequestError } from './bad-request.ts';
import { ENTITY_CONFLICT_ERROR_INSTANCE, type EntityConflictError } from './entity-conflict.ts';
import { ENTITY_NOT_FOUND_ERROR_INSTANCE, type EntityNotFoundError } from './entity-not-found.ts';
import { ENTITY_RELATION_INVALID_ERROR_INSTANCE, type EntityRelationInvalidError } from './entity-relation-invalid.ts';
import { INTERNAL_ERROR_INSTANCE, type InternalError } from './internal.ts';
import { PERMISSION_DENIED_ERROR_INSTANCE, type PermissionDeniedError } from './permission-denied.ts';
import { STORAGE_INSUFFICIENT_ERROR_INSTANCE, type StorageInsufficientError } from './storage-insufficient.ts';
import { UNAUTHORIZED_ERROR_INSTANCE, type UnauthorizedError } from './unauthorized.ts';

export function isBadRequestError(input: unknown): input is BadRequestError {
    if (hasInstanceof(input, BAD_REQUEST_ERROR_INSTANCE)) return true;
    if (!isHubError(input)) return false;
    return input.code === ErrorCode.BAD_REQUEST;
}

export function isUnauthorizedError(input: unknown): input is UnauthorizedError {
    if (hasInstanceof(input, UNAUTHORIZED_ERROR_INSTANCE)) return true;
    if (!isHubError(input)) return false;
    return input.code === ErrorCode.IDENTITY_UNAUTHORIZED;
}

export function isInternalError(input: unknown): input is InternalError {
    if (hasInstanceof(input, INTERNAL_ERROR_INSTANCE)) return true;
    if (!isHubError(input)) return false;
    return input.code === ErrorCode.INTERNAL_ERROR;
}

export function isEntityNotFoundError(input: unknown): input is EntityNotFoundError {
    if (hasInstanceof(input, ENTITY_NOT_FOUND_ERROR_INSTANCE)) return true;
    if (!isHubError(input)) return false;
    return input.code === ErrorCode.ENTITY_NOT_FOUND;
}

export function isEntityConflictError(input: unknown): input is EntityConflictError {
    if (hasInstanceof(input, ENTITY_CONFLICT_ERROR_INSTANCE)) return true;
    if (!isHubError(input)) return false;
    return input.code === ErrorCode.ENTITY_CONFLICT;
}

export function isEntityRelationInvalidError(input: unknown): input is EntityRelationInvalidError {
    if (hasInstanceof(input, ENTITY_RELATION_INVALID_ERROR_INSTANCE)) return true;
    if (!isHubError(input)) return false;
    return input.code === ErrorCode.ENTITY_RELATION_INVALID;
}

export function isPermissionDeniedError(input: unknown): input is PermissionDeniedError {
    if (hasInstanceof(input, PERMISSION_DENIED_ERROR_INSTANCE)) return true;
    if (!isHubError(input)) return false;
    return input.code === ErrorCode.PERMISSION_DENIED;
}

export function isStorageInsufficientError(input: unknown): input is StorageInsufficientError {
    if (hasInstanceof(input, STORAGE_INSUFFICIENT_ERROR_INSTANCE)) return true;
    if (!isHubError(input)) return false;
    return input.code === ErrorCode.STORAGE_INSUFFICIENT;
}
