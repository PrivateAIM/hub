/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IQuery } from '@rapiq/core';
import { Query } from '@rapiq/core';
import { TypeormAdapter } from '@rapiq/adapter-typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import type { EntityRepositoryPaginationMeta } from '@privateaim/server-kit';

/**
 * Apply a decoded rapiq query (IR) to the given TypeORM query builder.
 * Schema allow-lists, defaults and pagination bounds were already applied
 * at decode time (`decodeQuery` in core/query) — this helper only executes
 * the IR. Returns the applied pagination for the response meta block.
 *
 * Joins triggered by the parsed relations replicate the DISTINCT-id
 * pattern: when the builder already groups by the root id, every join
 * contributes its own `GROUP BY <alias>.id`.
 */
export function applyQuery(
    queryBuilder: SelectQueryBuilder<any>,
    query?: IQuery,
): { pagination: EntityRepositoryPaginationMeta } {
    const adapter = new TypeormAdapter({
        queryBuilder,
        relations: {
            onJoin: (_path, alias, qb) => {
                if (qb.expressionMap.groupBys.length > 0) {
                    qb.addGroupBy(`${alias}.id`);
                }
            },
        },
    });

    const { pagination } = adapter.execute(query ?? new Query({}));

    // With a join and a page, typeorm selects `DISTINCT <alias>.id` from the
    // inner query, so a sparse fieldset without `id` would reference a missing
    // column (500). The reach conditions join `analysis` on every family read.
    // ponytail: belongs in rapiq's fields adapter (always project the primary key).
    const { selects, mainAlias } = queryBuilder.expressionMap;
    if (
        mainAlias &&
        selects.length > 0 &&
        selects.every(({ selection }) => !(selection === mainAlias.name || selection === `${mainAlias.name}.id`))
    ) {
        queryBuilder.addSelect(`${mainAlias.name}.id`);
    }

    return { pagination };
}
