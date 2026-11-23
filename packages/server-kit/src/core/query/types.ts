/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IQuery, Schema } from '@rapiq/core';

export type ScopeReadQueryOptions = {
    /**
     * The permissions that grant the read, pre-gated as a disjunction
     * (holding any one is enough) and compiled into the row reach.
     */
    names: string[],
    /**
     * The schema of the rows. Its default fields are what a `post` row is
     * evaluated on (`checkFields`), whatever projection the read asked for.
     */
    schema: Schema<any>,
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

type ReadScopeBase = {
    query: IQuery,
    /**
     * The permissions a `post` row is evaluated against, any-of.
     */
    names: string[],
    /**
     * The row's realm column (property name) when it is not `realmId`.
     */
    realmAttributeName?: string,
};

/**
 * A read query with the actor's reach applied, executed with
 * `findManyScoped`.
 */
export type ReadScope = ReadScopeBase & ({
    /** The reach lowered: `query` carries it. */
    post: false,
} | {
    /**
     * The reach did not lower (`post`): `query` carries no reach at all and
     * every row it returns has to be decided by evaluation.
     */
    post: true,
    /**
     * The root fields the decision reads: the schema's defaults, the realm
     * column and the key. A projected read loads them next to the asked
     * fields (`widenReadProjection`); a gated field is never one of them.
     */
    checkFields: string[],
});

/**
 * A read query widened for a per-row decision (`widenReadProjection`).
 */
export type ReadProjection = {
    query: IQuery,
    /**
     * The root fields the decision sees, picked from the loaded row;
     * `undefined` when the read was not projected and the row as loaded is
     * the whole row.
     */
    attributes: string[] | undefined,
    /**
     * The paths loaded only for the decision, removed from the response
     * (`trimReadProjection`): a root field, a relation field, or a whole
     * relation the read did not ask for.
     */
    trimmed: string[],
};
