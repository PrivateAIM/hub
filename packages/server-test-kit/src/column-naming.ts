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
 * Selectable columns of `metadata` that appear in neither `fields.default` nor
 * `fields.allowed` of `schema`.
 *
 * rapiq's own `assertSchemaMatchesEntity` only checks one direction — that every
 * schema key resolves against the entity. The reverse is just as damaging and
 * completely silent: rapiq derives the root projection from `fields`, so a column
 * missing from both lists simply never appears in a response. No error, no log,
 * just an absent property. authup lost `role.builtIn` exactly this way.
 *
 * Relation-owned columns are excluded — they are projected through the relation,
 * not the root `fields` list.
 *
 * A schema that declares NO `fields` block at all is exempt: rapiq then decodes to
 * an empty projection (`fields: { value: [] }`, verified against `eventSchema`),
 * which applies no explicit select and lets TypeORM return every column. Nothing
 * can be missing, so there is nothing to assert. Note the two consequences that
 * shape does carry — a `select: false` column can never be opted into, and an
 * `include=` child is dropped (rapiq#821 / authup#3313) — neither of which this
 * helper is about.
 */
export function collectUncoveredColumns(
    schema: { fields?: { default?: readonly string[], allowed?: readonly string[] } },
    metadata: {
        columns: readonly {
            propertyName: string, 
            isSelect: boolean, 
            relationMetadata?: unknown 
        }[] 
    },
    exclusions: readonly string[] = [],
): string[] {
    const names = [
        ...(schema.fields?.default ?? []),
        ...(schema.fields?.allowed ?? []),
    ];

    // `defineSchema` normalizes, so `fields` is present even when the author
    // declared none — an EMPTY name set is what "no fields block" looks like.
    if (names.length === 0) {
        return [];
    }

    const declared = new Set<string>([...names, ...exclusions]);

    return metadata.columns
        .filter((column) => column.isSelect && !column.relationMetadata)
        .map((column) => column.propertyName)
        .filter((propertyName) => !declared.has(propertyName));
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

            // A relation with NO paired scalar FK property is named entirely by
            // @JoinColumn, so its `propertyName` IS the relation (`registry`) and
            // deliberately differs from the column (`registry_id`) — only the
            // no-uppercase rule above can apply there.
            //
            // Every FK in hub does have a paired scalar (`registryId`), whose
            // `propertyName` is the scalar, not the relation. Skipping on
            // `relationMetadata` alone would therefore exempt exactly the 17
            // columns this rename newly stamped: a lowercase typo such as
            // `@Column({ name: 'registryid' })` with a matching `@JoinColumn`
            // would pass both this guard and the synchronize()-based suites.
            if (column.relationMetadata && column.propertyName === column.relationMetadata.propertyName) {
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
