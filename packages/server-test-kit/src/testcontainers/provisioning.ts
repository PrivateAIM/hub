/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthupProvisioning } from './types.ts';

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
