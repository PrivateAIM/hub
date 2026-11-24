/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BuiltInPolicyType, reachesRecordOneOf, scopeReadQuery as scopeAuthupReadQuery } from '@authup/access';
import type { IQuery } from '@rapiq/core';
import type { ActorContext } from '../actor/index.ts';
import type { EntityRepositoryFindManyResult, IEntityRepository } from '../types.ts';
import { 
    buildCheckFields, 
    readCheckAttributes, 
    trimReadProjection, 
    widenReadProjection, 
} from './projection.ts';
import type { ReadScope, ScopeReadQueryOptions } from './types.ts';

/**
 * The gate every read runs: authup's `scopeReadQuery` pre-gates the read
 * permissions (a missing grant throws, i.e. 403), then lowers the caller's
 * reach onto the query; hub adds the fields a `post` decision reads.
 *
 * - `allow`       → the query unchanged.
 * - `conditional` → the compiled reach AND-appended (non-displaceable).
 * - `deny`        → matches nothing.
 * - `post`        → the reach cannot be expressed as a condition (a grant
 *                   policy that does not lower): the query is returned
 *                   unnarrowed and flagged with the fields the decision
 *                   reads, and each row is decided by evaluation. Run the
 *                   scope through {@link findManyScoped}, which does that;
 *                   the actor's realm is never the answer.
 */
export async function scopeReadQuery(
    query: IQuery,
    actor: ActorContext,
    options: ScopeReadQueryOptions,
): Promise<ReadScope> {
    const base = {
        query,
        names: options.names,
        ...(options.realmAttributeName ? { realmAttributeName: options.realmAttributeName } : {}),
    };

    const scope = await scopeAuthupReadQuery(query, actor.permissionEvaluator, {
        names: options.names,
        ...(typeof options.compile !== 'undefined' ? { compile: options.compile } : {}),
        // Forward the realm column only when set: naming one tells authup the
        // row may not carry a grant policy's fields, which turns every
        // lowerable grant policy into `post`. Without it the reach lowers
        // onto `realmId`.
        ...(options.realmAttributeName ? { realmAttributeName: options.realmAttributeName } : {}),
    });

    if (!scope.post) {
        return {
            ...base, 
            query: scope.query, 
            post: false, 
        };
    }

    return {
        ...base,
        post: true,
        checkFields: buildCheckFields(options.schema, options.realmAttributeName),
    };
}

/**
 * Run a scoped read. A lowered scope is the repository's answer as it is.
 *
 * A `post` scope is decided per row on ONE read: its projection is widened
 * to the scope's `checkFields` (the schema's defaults, the realm column and
 * the key), so each row is evaluated on its stored realm and every attribute
 * a policy can read, and the rows returned are the rows evaluated. What the
 * widening loaded beyond the asked projection is trimmed from the response;
 * a gated field (`select: false`, outside `fields.default`) is never loaded
 * for the check and, when the read asks for it, never shown to the policy.
 * The page may come back short or empty; `meta.total` stays the candidate
 * count, so a client paging by total still requests every page and no
 * reachable row on a later page is cut off.
 *
 * A record read appends `eq('id', id)` to the scope's query and runs it
 * through here too, so list and record share the decision.
 */
export async function findManyScoped<T extends object>(
    repository: Pick<IEntityRepository<T>, 'findMany'>,
    scope: ReadScope,
    actor: ActorContext,
): Promise<EntityRepositoryFindManyResult<T>> {
    if (!scope.post) {
        return repository.findMany(scope.query);
    }

    const projection = widenReadProjection(scope.query, scope.checkFields);
    const result = await repository.findMany(projection.query);

    const data: T[] = [];

    for (const row of result.data) {
        const attributes = readCheckAttributes(row, projection);
        const isReached = await reachesRecordOneOf(actor.permissionEvaluator, {
            name: scope.names,
            realm: readRealm(attributes, scope.realmAttributeName ?? 'realmId'),
            data: { [BuiltInPolicyType.ATTRIBUTES]: attributes },
        });

        if (isReached) {
            data.push(row);
        }
    }

    return { data: trimReadProjection(data, projection), meta: result.meta };
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
