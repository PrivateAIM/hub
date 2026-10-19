/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ITokenVerifier, TokenVerificationData } from '@authup/server-adapter-kit';
import { UnauthorizedError } from '@privateaim/errors';

/**
 * Stands in when no Authup URL is configured. Since 1.0.0-beta.70 authup's
 * `TokenVerifier` derives the introspection endpoint in its constructor and
 * throws a TypeError without a base URL, which would crash the boot of a
 * service run without `AUTHUP_URL` — a supported mode in which the
 * authorization middleware attaches no identity and every protected route
 * answers 401. Unreachable there (the middleware returns before verifying
 * without an Authup client), and fail-closed should that change.
 */
export class UnconfiguredTokenVerifier implements ITokenVerifier {
    async verify(): Promise<TokenVerificationData> {
        throw new UnauthorizedError('No Authup URL is configured, so no token can be verified.');
    }
}
