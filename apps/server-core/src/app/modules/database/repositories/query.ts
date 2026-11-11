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
import { DriverUtils } from 'typeorm/driver/DriverUtils.js';
import type { EntityRepositoryPaginationMeta } from '@privateaim/server-kit';

/**
 * With a join and a page, typeorm first selects `DISTINCT <alias>.id` and
 * every ORDER BY column from the original query, wrapped as `distinctAlias`,
 * so a sparse fieldset without them references missing columns (500).
 * The reach conditions join `analysis` on every family read.
 *
 * The primary key is added as a hydrated selection. An unselected sort column
 * is projected raw, under the alias typeorm expects, so it is never hydrated
 * into the response. Belongs in rapiq's fields adapter.
 */
function selectPaginationColumns(queryBuilder: SelectQueryBuilder<any>): void {
    const {
        selects,
        mainAlias,
        aliases,
    } = queryBuilder.expressionMap;

    if (!mainAlias) {
        return;
    }

    const isSelected = (aliasName: string, propertyPath: string) => selects.some(
        ({ selection }) => selection === aliasName || selection === `${aliasName}.${propertyPath}`,
    );

    if (!isSelected(mainAlias.name, 'id')) {
        queryBuilder.addSelect(`${mainAlias.name}.id`);
    }

    const keys = Object.keys(queryBuilder.expressionMap.allOrderBys);

    for (const key of keys) {
        const index = key.indexOf('.');

        if (index === -1) {
            continue;
        }

        const aliasName = key.slice(0, index);
        const propertyPath = key.slice(index + 1);

        const alias = aliases.find((item) => item.name === aliasName);
        const column = alias && alias.hasMetadata ?
            alias.metadata.findColumnWithPropertyPath(propertyPath) :
            undefined;

        if (!column || isSelected(aliasName, propertyPath)) {
            continue;
        }

        queryBuilder.addSelect(
            `${queryBuilder.escape(aliasName)}.${queryBuilder.escape(column.databaseName)}`,
            DriverUtils.buildAlias(queryBuilder.dataSource.driver, undefined, aliasName, column.databaseName),
        );
    }
}

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

    selectPaginationColumns(queryBuilder);

    return { pagination };
}
