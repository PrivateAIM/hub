/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ErrorCode } from './constants.ts';

/**
 * Default mapping from `ErrorCode` to HTTP status. Adapters apply this
 * and may layer their own overrides on top. Codes not listed here fall
 * back to 400 (Bad Request) — the right default for validation /
 * malformed-request style errors.
 */
export const ERROR_CODE_TO_STATUS: Readonly<Partial<Record<`${ErrorCode}`, number>>> = {
    // 401
    [ErrorCode.IDENTITY_UNAUTHORIZED]: 401,

    // 403
    [ErrorCode.PERMISSION_DENIED]: 403,

    // 404
    [ErrorCode.ENTITY_NOT_FOUND]: 404,

    // 409
    [ErrorCode.ENTITY_CONFLICT]: 409,

    // 500
    [ErrorCode.INTERNAL_ERROR]: 500,

    // 507
    [ErrorCode.STORAGE_INSUFFICIENT]: 507,
};

/**
 * Resolve an HTTP status for a given error code. Unknown codes fall back
 * to `fallback` (default 400).
 */
export function httpStatusFromCode(code: string, fallback = 400): number {
    return ERROR_CODE_TO_STATUS[code as `${ErrorCode}`] ?? fallback;
}

/**
 * Resolve a semantic `ErrorCode` for a foreign HTTP status. Used at the
 * boundary where a non-HubError (e.g. `@ebec/http` HTTPError thrown by
 * the framework, or a foreign service response) enters our system and
 * needs to be normalized into a `HubError` with hub-vocabulary code.
 * Status is the only stable handshake across the two vocabularies.
 *
 * Default mapping covers the common HTTP statuses. Anything 5xx
 * collapses to `INTERNAL_ERROR`; unknown 4xx collapses to `BAD_REQUEST`.
 */
export function codeFromHttpStatus(status: number): ErrorCode {
    if (status === 404) return ErrorCode.ENTITY_NOT_FOUND;
    if (status === 409) return ErrorCode.ENTITY_CONFLICT;
    if (status === 401) return ErrorCode.IDENTITY_UNAUTHORIZED;
    if (status === 403) return ErrorCode.PERMISSION_DENIED;
    if (status === 507) return ErrorCode.STORAGE_INSUFFICIENT;
    if (status >= 500) return ErrorCode.INTERNAL_ERROR;
    return ErrorCode.BAD_REQUEST;
}
