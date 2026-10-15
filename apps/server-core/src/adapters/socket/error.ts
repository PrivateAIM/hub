/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { HubError } from '@privateaim/errors';
import { InternalError, PermissionDeniedError } from '@privateaim/errors';
import { isPermissionDenial } from '@privateaim/server-kit';

/**
 * The error a subscribe handler acks with when its permission check fails.
 *
 * A permission denial answers 403, not 401: the socket is already
 * authenticated. Any other failure (catalog fetch, transport error, bug)
 * becomes an internal error, so it does not read as a denial and its details
 * do not reach the client.
 */
export function buildSocketSubscribeError(error: unknown): HubError {
    return isPermissionDenial(error) ? new PermissionDeniedError() : new InternalError();
}
