/*
 * Copyright (c) 2024-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

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
import { EntityRelationLookupError } from 'typeorm-extension';
import { buildErrorMessageForAttributes, isValidupError, stringifyPath } from 'validup';

/**
 * Normalize an unknown error to a HubError. Recognised shapes:
 *
 * 1. HubError instance                 → returned as-is
 * 2. EntityRelationLookupError         → EntityRelationInvalidError
 * 3. validup Issue error               → BadRequestError carrying issues
 * 4. foreign @ebec/http HTTPError      → HubError with the closest semantic code
 * 5. driver error w/ a recognised code → EntityConflictError or StorageInsufficientError
 * 6. anything else                     → InternalError
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

    if (isValidupError(input)) {
        const paths = input.issues.map((issue) => stringifyPath(issue.path));
        const error = new BadRequestError({
            stack: input.stack,
            message: input.message || buildErrorMessageForAttributes(paths),
        });

        error.issues.push(...input.issues);
        return error;
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
