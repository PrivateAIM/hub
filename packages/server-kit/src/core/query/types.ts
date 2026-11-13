/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IQuery } from '@rapiq/core';

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

/**
 * A read query with the actor's reach applied, executed with
 * `findManyScoped`.
 */
export type ReadScope = {
    query: IQuery,
    /**
     * The reach did not lower (`post`): `query` carries no reach at all and
     * every row it returns has to be decided by evaluation.
     */
    post: boolean,
    /**
     * The permissions a `post` row is evaluated against, any-of.
     */
    names: string[],
    /**
     * The row's realm column (property name) when it is not `realmId`.
     */
    realmAttributeName?: string,
};
