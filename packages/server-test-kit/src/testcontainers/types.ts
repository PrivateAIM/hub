/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/**
 * A single global permission entry for an Authup provisioning file.
 */
export type AuthupProvisioningPermission = {
    attributes: {
        name: string
    }
};

/**
 * The subset of Authup's root provisioning shape we emit for tests.
 *
 * All top-level entries are global (`realmId = null`, `clientId = null`);
 * the built-in `admin` role's `globalPermissions: ['*']` picks them up
 * automatically at provisioning time.
 */
export type AuthupProvisioning = {
    permissions?: AuthupProvisioningPermission[]
};

/**
 * The subset of Authup's token-introspection response that
 * `assertAuthupProvisioning` reads back to confirm a suite's permissions
 * really resolved.
 */
export type AuthupIntrospectionResult = {
    active?: boolean,
    permissions?: { name: string }[]
};

/**
 * Resolved database connection details, propagated from the (single) global
 * setup process to the individual test workers via vitest `provide`/`inject`.
 */
export type DatabaseConnection = {
    type: 'postgres',
    host: string,
    port: number,
    username: string,
    password: string,
    database: string,
};
