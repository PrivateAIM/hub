/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ICondition, IQuery } from '@rapiq/core';
import { Query } from '@rapiq/core';

/**
 * Append server-derived conditions (a route realm, an owner scope, a
 * compiled read reach, ...) onto a decoded query by AND-wrapping its filter
 * tree. The wrap makes the appended scope non-displaceable: a client-sent
 * condition on the same field intersects with the scope instead of
 * replacing it, and compound client trees (`or(...)`) are preserved as-is.
 * Appended conditions do not pass through `decodeQuery`, so the schema
 * allow-lists do not constrain them (server-derived context).
 *
 * Immutable: returns a new `Query` whose filters node is the AND-wrapped
 * successor; every other parameter node is carried over by reference.
 */
export function appendQueryConditions(query: IQuery, ...conditions: ICondition[]): Query {
    return new Query({
        fields: query.fields,
        filters: query.filters.and(...conditions),
        relations: query.relations,
        pagination: query.pagination,
        sorts: query.sorts,
    });
}
