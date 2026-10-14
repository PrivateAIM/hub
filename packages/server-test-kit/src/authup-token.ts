/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { createAuthupUserTokenCreator } from '@privateaim/server-kit';
import type { AuthupPermissionRow } from './types.ts';

/**
 * Resolve `path` against an Authup base URL WITHOUT dropping a path prefix.
 * `new URL('users', 'http://host/auth')` resolves to `http://host/users` — the
 * last base segment counts as a file name unless the base ends with a slash —
 * so an `AUTHUP_URL` served under a sub-path would silently miss Authup.
 */
export function buildAuthupURL(baseURL: string, path: string): URL {
    const base = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;

    return new URL(path.replace(/^\/+/, ''), base);
}

/**
 * Pick the permission a test user is granted. A name is unique only per
 * (realm, client), so only the global row — bound to neither — qualifies;
 * granting a client- or realm-bound duplicate instead would make a spec pass
 * or fail for the wrong grant.
 */
export function selectGlobalPermission(rows: AuthupPermissionRow[]): AuthupPermissionRow | undefined {
    return rows.find((row) => !row.clientId && !row.realmId);
}

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

/**
 * Mint an access token for a freshly created master-realm user that holds
 * EXACTLY `permissionNames` (default: none), so a suite can exercise a real
 * authorization DENIAL — the admin token resolves every provisioned
 * permission and can never be refused.
 *
 * The user is created through Authup's management API with the admin token,
 * under a random name so repeated calls (and parallel spec files sharing one
 * Authup) never collide. Each requested permission must already exist, i.e.
 * be part of the suite's provisioned set.
 */
export async function createRestrictedAccessToken(
    permissionNames: string[] = [],
    baseURL = process.env.AUTHUP_URL,
): Promise<string> {
    if (!baseURL) {
        throw new Error('The AUTHUP_URL is not configured — cannot mint a restricted access token.');
    }

    const adminToken = await createAdminAccessToken(baseURL);
    const request = async <T>(method: string, path: string, body?: Record<string, any>): Promise<T> => {
        const response = await fetch(buildAuthupURL(baseURL, path), {
            method,
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${adminToken}`,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            throw new Error(`Authup ${method} ${path} failed (${response.status}): ${await response.text()}`);
        }

        return response.json();
    };

    const name = `restricted-${randomUUID().slice(0, 8)}`;
    const password = 'start123start';

    const { data: user } = await request<{ data: { id: string } }>('POST', 'users', {
        name,
        email: `${name}@example.com`,
        password,
        active: true,
    });

    for (const permissionName of permissionNames) {
        const { data: permissions } = await request<{ data: AuthupPermissionRow[] }>(
            'GET',
            `permissions?filter[name]=${encodeURIComponent(permissionName)}`,
        );
        const permission = selectGlobalPermission(permissions);
        if (!permission) {
            throw new Error(`The global permission ${permissionName} is not provisioned — cannot grant it to ${name}.`);
        }

        await request('POST', 'user-permissions', {
            userId: user.id,
            permissionId: permission.id,
        });
    }

    const tokenCreator = createAuthupUserTokenCreator({
        baseURL,
        name,
        password,
        realm: 'master',
    });

    const response = await tokenCreator();

    return response.access_token;
}
