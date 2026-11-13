/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuiltInPolicyType, reachesRecordOneOf } from '@authup/access';
import type { IQuery } from '@rapiq/core';
import { Query, inArray } from '@rapiq/core';
import type { ActorContext } from '../actor/index.ts';
import type { EntityRepositoryFindManyResult, IEntityRepository } from '../types.ts';
import { appendQueryConditions } from './conditions.ts';
import type { ReadScope, ScopeReadQueryOptions } from './types.ts';

/**
 * The gate every read runs: pre-gate the read permissions (a missing grant
 * throws, i.e. 403), then lower the caller's reach onto the query (port of
 * authup's app-level `scopeReadQuery`, apps/server-core/src/core/query/scope.ts).
 *
 * - `allow`       → the query unchanged.
 * - `conditional` → the compiled reach AND-appended (non-displaceable).
 * - `deny`        → matches nothing.
 * - `post`        → the reach cannot be expressed as a condition (a grant
 *                   policy that does not lower): the query is returned
 *                   unnarrowed and flagged, and each row is decided by
 *                   evaluation. Run the scope through {@link findManyScoped},
 *                   which does that; the actor's realm is never the answer.
 */
export async function scopeReadQuery(
    query: IQuery,
    actor: ActorContext,
    options: ScopeReadQueryOptions,
): Promise<ReadScope> {
    const scope = (scoped: IQuery, post: boolean): ReadScope => ({
        query: scoped,
        post,
        names: options.names,
        ...(options.realmAttributeName ? { realmAttributeName: options.realmAttributeName } : {}),
    });

    await actor.permissionEvaluator.preEvaluateOneOf({ name: options.names });

    if (options.compile === false) {
        return scope(query, false);
    }

    // Forward the realm column only when set, like authup: naming one tells
    // authup the row may not carry a grant policy's fields, which turns every
    // lowerable grant policy into `post`. Without it the reach lowers onto
    // `realmId`.
    const compiled = await actor.permissionEvaluator.compile({
        name: options.names,
        ...(options.realmAttributeName ? { realmAttributeName: options.realmAttributeName } : {}),
    });

    switch (compiled.verdict) {
        case 'allow':
            return scope(query, false);
        case 'conditional':
            return scope(appendQueryConditions(query, compiled.condition), false);
        case 'deny':
            return scope(appendQueryConditions(query, inArray('id', [])), false);
        default:
            return scope(query, true);
    }
}

/**
 * Run a scoped read. A lowered scope is the repository's answer as it is. A
 * `post` scope keeps only the rows a grant of one of the names reaches,
 * evaluated against the stored row (re-read by id in one query, so a sparse
 * fieldset cannot hide the realm or an attribute a policy reads) and its own
 * realm. The page may come back short or empty; `meta.total` stays the
 * candidate count, so a client paging by total still requests every page and
 * no reachable row on a later page is cut off.
 *
 * A record read appends `eq('id', id)` to the scope's query and runs it
 * through here too, so list and record share the decision.
 */
export async function findManyScoped<T extends object>(
    repository: Pick<IEntityRepository<T>, 'findMany'>,
    scope: ReadScope,
    actor: ActorContext,
): Promise<EntityRepositoryFindManyResult<T>> {
    const result = await repository.findMany(scope.query);

    if (!scope.post || result.data.length === 0) {
        return result;
    }

    const { data: stored } = await repository.findMany(appendQueryConditions(
        new Query({}),
        inArray('id', result.data.map((row) => Reflect.get(row, 'id'))),
    ));

    const reached = new Set<unknown>();

    for (const row of stored) {
        const isReached = await reachesRecordOneOf(actor.permissionEvaluator, {
            name: scope.names,
            realm: readRealm(row, scope.realmAttributeName ?? 'realmId'),
            data: { [BuiltInPolicyType.ATTRIBUTES]: row },
        });

        if (isReached) {
            reached.add(Reflect.get(row, 'id'));
        }
    }

    const data = result.data.filter((row) => reached.has(Reflect.get(row, 'id')));

    return { data, meta: result.meta };
}

/**
 * The row's realm, raw. Anything but a realm id or `null` reads as
 * `undefined`, which the record helpers refuse instead of matching.
 */
function readRealm(row: object, attributeName: string): string | null | undefined {
    const value: unknown = Reflect.get(row, attributeName);

    if (typeof value === 'string') {
        return value;
    }

    return value === null ? null : undefined;
}
