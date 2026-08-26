/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createAdminAccessToken } from '../authup-token.ts';
import type { AuthupIntrospectionResult, AuthupProvisioning } from './types.ts';

/**
 * Build the Authup provisioning payload for a service's test suite from the set of
 * permission names that service actually checks.
 *
 * Every name is declared as a top-level (global) permission so that Authup's
 * built-in `admin` role — bound to `globalPermissions: ['*']` — resolves them at
 * provisioning time. A token minted for `admin`/`master` therefore carries the
 * service's permission set, which is what the (now enforcing) authorization
 * middleware evaluates via introspection.
 */
export function buildAuthupProvisioning(permissionNames: string[]): AuthupProvisioning {
    return { permissions: permissionNames.map((name) => ({ attributes: { name } })) };
}

/**
 * Serialize the provisioning payload as an ES module with a `default` export,
 * the form Authup's `FileProvisioningSource` expects for `.mjs` files.
 */
export function buildAuthupProvisioningModule(permissionNames: string[]): string {
    return `export default ${JSON.stringify(buildAuthupProvisioning(permissionNames), null, 4)};\n`;
}

/**
 * Fail loudly when the permissions a suite depends on are not actually
 * resolvable for the `admin`/`master` token.
 *
 * This exists because the failure it catches is otherwise SILENT and remote
 * from its cause. Authup loads provisioning files from its writable directory;
 * a file written anywhere else is simply never read, so the container starts,
 * reports healthy, and answers introspection normally — with Authup's own
 * permissions and none of hub's. The first symptom is every authorizing
 * endpoint in the suite failing with `The evaluation of permissions <name>
 * failed`, dozens of assertions away from the mount path that caused it.
 * (`1.0.0-beta.63` moved that directory and did exactly this.)
 *
 * It also covers an externally supplied `AUTHUP_URL`, where the same set has
 * to be provisioned by hand and can drift without warning.
 */
export async function assertAuthupProvisioning(
    baseURL: string,
    permissionNames: string[],
): Promise<void> {
    if (permissionNames.length === 0) {
        return;
    }

    const token = await createAdminAccessToken(baseURL);

    const response = await fetch(new URL('token/introspect', baseURL), {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
    });

    if (!response.ok) {
        throw new Error(
            `Authup token introspection failed (${response.status}) while verifying provisioning at ${baseURL}.`,
        );
    }

    const body: AuthupIntrospectionResult = await response.json();

    if (!body.active) {
        throw new Error(
            `Authup reported the freshly minted admin token as inactive at ${baseURL}.`,
        );
    }

    const resolved = new Set((body.permissions || []).map((permission) => permission.name));
    const missing = permissionNames.filter((name) => !resolved.has(name));

    if (missing.length > 0) {
        throw new Error(
            `Authup did not provision ${missing.length} of ${permissionNames.length} permission(s) the suite checks: ${missing.join(', ')}.\n` +
            `The admin token resolved ${resolved.size} permission(s), so Authup is reachable and the token is valid — ` +
            'the provisioning file was not applied. Verify it is written into Authup\'s writable directory ' +
            '(WRITABLE_DIRECTORY_PATH) under `provisioning/`, or, for an externally provided AUTHUP_URL, that these ' +
            'permissions exist and are bound to the admin role.',
        );
    }
}
