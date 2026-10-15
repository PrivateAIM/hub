/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export type ScopeReadQueryOptions = {
    /**
     * The permissions that grant the read, pre-gated as a disjunction
     * (holding any one is enough) and compiled into the row reach.
     */
    names: string[],
    /**
     * `false` for a capability-only gate: the pre-gate runs, no realm
     * reach is lowered (global catalogs such as nodes or master images).
     */
    compile?: boolean,
    /**
     * The row's realm column (property name), default `realmId`.
     */
    realmAttributeName?: string,
};
