/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createAuthupUserTokenCreator } from '@privateaim/server-kit';

/**
 * Mint an access token for the `admin`/`master` user against the (test) Authup
 * instance. The admin user holds every provisioned permission, so the token
 * passes the now-enforced authorization middleware for any endpoint.
 *
 * Used by tests that issue raw HTTP requests (uploads, streaming) instead of the
 * authenticated API client.
 *
 * This mints with the fixed `admin` / `start123` / `master` credentials — the same
 * contract the started Authup container provides (`USER_ADMIN_PASSWORD=start123`)
 * and that the API-client hook uses (`test/app/http.ts`). An externally provided
 * `AUTHUP_URL` MUST therefore expose that same master-realm admin, otherwise token
 * minting (and the authenticated HTTP tests) will fail.
 */
export async function createAdminAccessToken(baseURL = process.env.AUTHUP_URL): Promise<string> {
    if (!baseURL) {
        throw new Error('The AUTHUP_URL is not configured — cannot mint an admin access token.');
    }

    const tokenCreator = createAuthupUserTokenCreator({
        baseURL,
        name: 'admin',
        password: 'start123',
        realm: 'master',
    });

    const response = await tokenCreator();

    return response.access_token;
}

/**
 * Convenience wrapper returning a ready-to-use `Bearer` authorization header value.
 */
export async function createAdminAuthorizationHeader(baseURL?: string): Promise<string> {
    return `Bearer ${await createAdminAccessToken(baseURL)}`;
}
