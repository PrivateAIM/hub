/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { DataSource, DataSourceOptions } from 'typeorm';
import { snakeCase } from 'typeorm/util/StringUtils.js';

export type ColumnNamingViolation = {
    table: string,
    property: string,
    column: string,
    reason: string,
};

/**
 * Turn a service's production DataSource options into ones that can be
 * initialized without any external database: an in-memory sqlite driver and no
 * migration globs. `initialize()` then builds `entityMetadatas` purely from the
 * decorators, so the guard sees exactly the entity list production uses and can
 * never drift from it.
 */
export function toMetadataOnlyDataSourceOptions(options: DataSourceOptions): DataSourceOptions {
    return {
        ...options,
        type: 'better-sqlite3',
        database: ':memory:',
        migrations: [],
        synchronize: false,
    } as DataSourceOptions;
}

/**
 * Plan 017: database columns stay snake_case, pinned per column by an explicit
 * `@Column({ name })` / `@JoinColumn({ name })`. There is no naming strategy, so
 * a forgotten explicit name silently falls back to TypeORM's
 * `DefaultNamingStrategy`, which yields the camelCase PROPERTY as the column
 * name (`realmId`) and diverges from the frozen migration column (`realm_id`).
 *
 * The `synchronize()`-based suites cannot catch that: they generate the schema
 * from the same metadata they then read through, so write and read stay
 * self-consistent and only production diverges. This guard is what closes it.
 */
export function collectColumnNamingViolations(dataSource: DataSource): ColumnNamingViolation[] {
    const violations: ColumnNamingViolation[] = [];

    for (const metadata of dataSource.entityMetadatas) {
        for (const column of metadata.columns) {
            const base = {
                table: metadata.tableName,
                property: column.propertyName,
                column: column.databaseName,
            };

            if (/[A-Z]/.test(column.databaseName)) {
                violations.push({
                    ...base,
                    reason: 'column name is not snake_case — a missing @Column({ name })',
                });
                continue;
            }

            // A relation-owned FK column is named by @JoinColumn, so its property
            // (the relation, e.g. `registry`) deliberately differs from the column
            // (`registry_id`). The no-uppercase rule above still covers it.
            if (column.relationMetadata) {
                continue;
            }

            if (column.databaseName !== snakeCase(column.propertyName)) {
                violations.push({
                    ...base,
                    reason: `column name does not match snakeCase(property) — expected '${snakeCase(column.propertyName)}'`,
                });
            }
        }
    }

    return violations;
}
