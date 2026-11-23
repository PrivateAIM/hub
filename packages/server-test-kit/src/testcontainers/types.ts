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
 * What the built-in `system` client may delegate through token exchange
 * (one Authup capability per audience).
 */
export type AuthupTokenExchangeProvisioning = {
    audience: string,
    /**
     * Space-separated capability types the client may delegate.
     */
    value: string,
    /**
     * Maximum lifetime of an issued token, in seconds.
     */
    maxAge: number,
    realmScope: 'own' | 'any',
};

export type AuthupProvisioningOptions = {
    tokenExchange?: AuthupTokenExchangeProvisioning,
};

export type AuthupProvisioningRealm = {
    attributes: { name: string },
    strategy: { type: 'merge' },
    relations: {
        clients: {
            attributes: { name: string, grantTypes: string },
            strategy: { type: 'merge' },
            relations: {
                tokenExchangeCapabilities: {
                    attributes: AuthupTokenExchangeProvisioning,
                    strategy: { type: 'replace' },
                }[],
            },
        }[],
    },
};

/**
 * The subset of Authup's root provisioning shape we emit for tests.
 *
 * Top-level permissions are global (`realmId = null`, `clientId = null`);
 * the built-in `admin` role's `globalPermissions: ['*']` picks them up
 * automatically at provisioning time. Token exchange is provisioned onto the
 * built-in `system` client of the `master` realm.
 */
export type AuthupProvisioning = {
    permissions?: AuthupProvisioningPermission[],
    realms?: AuthupProvisioningRealm[],
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
    type: 'postgres' | 'mysql',
    host: string,
    port: number,
    username: string,
    password: string,
    database: string,
};
