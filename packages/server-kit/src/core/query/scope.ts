/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IQuery } from '@rapiq/core';
import { eq, inArray } from '@rapiq/core';
import type { ActorContext } from '../actor/index.ts';
import { appendQueryConditions } from './conditions.ts';
import type { ScopeReadQueryOptions } from './types.ts';

/**
 * The gate every read runs: pre-gate the read permissions (a missing grant
 * throws, i.e. 403), then lower the caller's reach onto the query (port of
 * authup's app-level `scopeReadQuery`, apps/server-core/src/core/query/scope.ts).
 *
 * - `allow`       → the query unchanged.
 * - `conditional` → the compiled reach AND-appended (non-displaceable).
 * - `deny`        → matches nothing.
 * - `post`        → a grant policy that cannot lower onto a column; narrowed
 *                   to the actor's own realm. An actor without a realm gets
 *                   nothing.
 *
 * Deliberate simplification: `post` narrows by realm only and ignores the
 * unlowerable grant policy, so within the actor's realm it can return rows
 * that policy would exclude. Add per-row evaluation (as authup's role/event
 * services do) once deployments attach such policies to read grants.
 */
export async function scopeReadQuery(
    query: IQuery,
    actor: ActorContext,
    options: ScopeReadQueryOptions,
): Promise<IQuery> {
    await actor.permissionEvaluator.preEvaluateOneOf({ name: options.names });

    if (options.compile === false) {
        return query;
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
            return query;
        case 'conditional':
            return appendQueryConditions(query, compiled.condition);
        case 'deny':
            return appendQueryConditions(query, matchNothing());
        default: {
            // `post`: fall back to the actor's own realm.
            if (!actor.realm) {
                return appendQueryConditions(query, matchNothing());
            }

            const realmAttributeName = options.realmAttributeName ?? 'realmId';

            return appendQueryConditions(query, eq(realmAttributeName, actor.realm.id));
        }
    }
}

function matchNothing() {
    return inArray('id', []);
}
