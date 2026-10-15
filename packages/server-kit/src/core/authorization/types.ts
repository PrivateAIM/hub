/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

/** The record a single-record write is evaluated against. */
export type RecordReach = {
    /**
     * The record's realm, or the target realm on create. `null` is a global
     * row: only `ownOrNull`/`any` grants reach it. Required, so a caller
     * cannot drop the realm by omission — without it no reach is applied.
     */
    realmId: string | null | undefined;
    /** The row, for attribute policies on the grant. */
    attributes?: Record<string, any>;
};
