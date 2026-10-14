/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { BadRequestError } from '@privateaim/errors';
import type { IFilters, IQuery } from '@rapiq/core';
import {
    FilterCompoundOperator,
    FilterFieldOperator,
    isFilter,
    isFilters,
} from '@rapiq/core';

/**
 * Flatten the equality leaf filters of a decoded query into a
 * `field -> string value` map. Used by the log controllers — server-core's
 * analysis-log proxies and server-telemetry's `/logs` — which forward the
 * filters to VictoriaLogs (directly, or via the telemetry client) as label
 * equalities. One shared implementation on purpose: the two copies drifted,
 * and the unguarded one sat on the `DELETE /logs` path.
 *
 * Only positive equality (`eq`) leaves combined with `and` are meaningful
 * here — the telemetry label API has no notion of negation/comparison/OR.
 * The rapiq v2 expression dialect *can* express those (`not(eq(...))`,
 * `or(...)`, `lt(...)`), and the schema allow-list constrains field names but
 * not operators. Silently flattening such a filter to a bare equality would
 * forward the **inverse** (or an arbitrary last-wins branch) to the log
 * read/delete endpoints, so reject any non-`eq` leaf or non-`and` compound
 * with a 400 instead. The same goes for a field filtered more than once.
 */
export function collectRootFilterValues(query: IQuery): Record<string, string> {
    const out: Record<string, string> = {};

    const visitGroup = (group: IFilters) => {
        if (group.operator !== FilterCompoundOperator.AND) {
            throw new BadRequestError(`The filter compound operator '${group.operator}' is not supported here; only 'and' of equality filters is allowed.`);
        }

        for (const condition of group.value) {
            if (isFilters(condition)) {
                visitGroup(condition);
                continue;
            }

            // Only a leaf `Filter` (carries a field) is forwardable; any other
            // ICondition implementation has no label semantics here.
            if (!isFilter(condition)) {
                throw new BadRequestError(`The filter condition '${condition.operator}' is not supported here; only equality (eq) filters are allowed.`);
            }

            if (condition.operator !== FilterFieldOperator.EQUAL) {
                throw new BadRequestError(`The filter operator '${condition.operator}' on '${condition.field}' is not supported here; only equality (eq) filters are allowed.`);
            }

            // A label map holds one value per field, so a repeated field
            // cannot be forwarded faithfully: `and(eq(f,A), eq(f,B))` matches
            // nothing, while last-wins would forward `f=B` — and on the delete
            // path, drop B's logs.
            if (Object.prototype.hasOwnProperty.call(out, condition.field)) {
                throw new BadRequestError(`The filter field '${condition.field}' may only be specified once here.`);
            }

            out[condition.field] = `${condition.value}`;
        }
    };

    if (isFilters(query.filters)) {
        visitGroup(query.filters);
    }

    return out;
}
