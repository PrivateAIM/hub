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
 * All top-level entries are global (`realm_id = null`, `client_id = null`);
 * the built-in `admin` role's `globalPermissions: ['*']` picks them up
 * automatically at provisioning time.
 */
export type AuthupProvisioning = {
    permissions?: AuthupProvisioningPermission[]
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
