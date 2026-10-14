/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { InternalError, PermissionDeniedError } from '@privateaim/errors';
import { isPermissionDenial } from '../../core/utils/permission.ts';

/**
 * The error a subscribe handler acks with. A permission denial answers 403 —
 * the socket is authenticated, so 401 would be wrong. Anything else (catalog
 * fetch, transport error, bug) is an internal error: it must not read as a
 * denial, and its details must not reach the client.
 */
export function buildSocketSubscribeError(error: unknown): Error {
    return isPermissionDenial(error) ? new PermissionDeniedError() : new InternalError();
}
