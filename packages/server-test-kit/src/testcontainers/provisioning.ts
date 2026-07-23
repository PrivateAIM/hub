/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName } from '@privateaim/kit';
import type { AuthupProvisioning } from './types.ts';

/**
 * Build the Authup provisioning payload for the test suites from the canonical
 * {@link PermissionName} taxonomy.
 *
 * Every hub permission is declared as a top-level (global) permission so that
 * Authup's built-in `admin` role — bound to `globalPermissions: ['*']` — resolves
 * them at provisioning time. A token minted for `admin`/`master` therefore carries
 * the full permission set, which is what the (now enforcing) authorization
 * middleware evaluates via introspection.
 */
export function buildAuthupProvisioning(): AuthupProvisioning {
    const names = Object.values(PermissionName);

    return { permissions: names.map((name) => ({ attributes: { name } })) };
}

/**
 * Serialize the provisioning payload as an ES module with a `default` export,
 * the form Authup's `FileProvisioningSource` expects for `.mjs` files.
 */
export function buildAuthupProvisioningModule(): string {
    return `export default ${JSON.stringify(buildAuthupProvisioning(), null, 4)};\n`;
}
