/*
 * Copyright (c) 2024-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isAuthorizationCatalogStaleError, isPermissionError } from '@authup/access';
import { isObject } from '@authup/kit';
import {
    BadRequestError,
    EntityConflictError,
    EntityRelationInvalidError,
    HubError,
    InternalError,
    StorageInsufficientError,
    codeFromHttpStatus,
    isHubError,
} from '@privateaim/errors';
import { isHTTPError } from '@ebec/http';
import { CodecError, ParseError } from '@rapiq/core';
import { EntityRelationLookupError } from 'typeorm-extension';
import { buildErrorMessageForAttributes, isValidupError, stringifyPath } from 'validup';

/**
 * Normalize an unknown error to a HubError. Recognised shapes:
 *
 * 1. HubError instance                 → returned as-is
 * 2. EntityRelationLookupError         → EntityRelationInvalidError
 * 3. authup PermissionError          → HubError keeping its permission_* code (403)
 * 4. stale authorization catalog       → InternalError
 * 5. rapiq decode error                → BadRequestError carrying its parse trace
 *    (ParseError covers the per-parameter subclasses, CodecError an unresolvable
 *    codec stamp — both are triggered by wire input; Adapter/Build/Merge/Schema
 *    errors stay internal)
 * 6. validup Issue error               → BadRequestError carrying issues
 * 7. foreign @ebec/http HTTPError      → HubError with the closest semantic code
 * 8. driver error w/ a recognised code → EntityConflictError or StorageInsufficientError
 * 9. anything else                     → InternalError
 *
 * The HTTP-status concern is handled separately by `httpStatusFromCode` in
 * the adapter — this function only assigns a semantic `code`.
 */
export function sanitizeError(input: unknown): HubError {
    if (isHubError(input)) {
        return input;
    }

    if (input instanceof EntityRelationLookupError) {
        return new EntityRelationInvalidError({
            message: input.message,
            stack: input.stack,
        });
    }

    // An evaluator denial. ABOVE the validup branch for the same reason as the
    // rapiq branch below: `evaluationFailed` carries the failed policy's issues,
    // so the validup shape fallback claimed it and the denial answered 400;
    // `deniedAll` (no issues) fell through to the internal branch and answered
    // 500. The authup code is kept verbatim — every `permission_*` code maps to
    // 403 in `ERROR_CODE_TO_STATUS`, as it does upstream in `@authup/errors`.
    if (isPermissionError(input)) {
        return new HubError({
            code: input.code,
            message: input.message,
            stack: input.stack,
            issues: input.issues,
        });
    }

    // The catalog this request fetched predates a grant its token carries — a
    // definition or junction row created between the catalog read and the
    // introspection. Not the caller's fault and not a denial, so neither 4xx
    // fits; a retry (which refetches the catalog) resolves it. Answered 500 so
    // it is logged as a server error rather than hidden behind a client status.
    if (isAuthorizationCatalogStaleError(input)) {
        return new InternalError({
            message: input.message,
            stack: input.stack,
        });
    }

    // BEFORE the validup branch, and that order is load-bearing. `isValidupError`
    // falls back to a SHAPE check — any `Error` carrying a non-empty, well-formed
    // `issues` array matches — and since @ebec/core 1.3.2 every `BaseError` has an
    // `issues` array, a rapiq `ParseError` that collected a trace now satisfies it.
    // Classified there, a decode failure would be reported as a validation failure
    // and its message rebuilt from validup's attribute-path helper. Same trap as the
    // one `isHubError` had to be narrowed for; validup's guard is upstream, so the
    // fix here is to claim rapiq's errors first.
    if (input instanceof ParseError || input instanceof CodecError) {
        // The trace is the whole diagnostic. Since @rapiq/core 2.2 a parse records
        // every violation instead of stopping at the first and raises ONE aggregate
        // whose message is only a count — `The input was rejected: 2 violations.` —
        // so without `issues` a 400 no longer tells the client which key was
        // rejected or why. Each issue carries the machine-readable `code`, the
        // canonical `path`, the raw client `key` and the offending value.
        //
        // Passed through unmapped: @ebec/core 1.3.2 vendored blemish's issue model,
        // which is the one rapiq emits, so a rapiq issue IS the `Issue` that
        // `HubError` and the validup branch already carry. Note `meta.parameter` is
        // the CANONICAL parameter name (`filters`, `relations`), not the URL
        // spelling the client sent (`filter`, `include`) — `path` and `key` are
        // what identify the offending input.
        return new BadRequestError({
            message: input.message,
            stack: input.stack,
            issues: input.issues,
        });
    }

    if (isValidupError(input)) {
        const paths = input.issues.map((issue) => stringifyPath(issue.path));
        return new BadRequestError({
            stack: input.stack,
            message: input.message || buildErrorMessageForAttributes(paths),
            issues: input.issues,
        });
    }

    if (isHTTPError(input)) {
        return new HubError({
            code: codeFromHttpStatus(input.status),
            message: input.message,
            stack: input.stack,
        });
    }

    if (isObject(input)) {
        const code = Object.prototype.hasOwnProperty.call(input, 'code') && typeof input.code === 'string' ?
            input.code :
            undefined;

        /**
         * @see https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html
         */
        switch (code) {
            case '23505':
            case 'ER_DUP_ENTRY':
            case 'SQLITE_CONSTRAINT_UNIQUE': {
                return new EntityConflictError({
                    message: 'An entry with some unique attributes already exists.',
                    stack: input.stack as string | undefined,
                });
            }
            case 'ER_DISK_FULL':
                return new StorageInsufficientError({
                    message: 'No database operation possible, due to the lack of free disk space.',
                    stack: input.stack as string | undefined,
                });
        }

        return new InternalError({
            message: input.message as string | undefined,
            stack: input.stack as string | undefined,
        });
    }

    return new InternalError();
}
