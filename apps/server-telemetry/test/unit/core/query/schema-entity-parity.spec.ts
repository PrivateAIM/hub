/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { assertSchemaMatchesEntity } from '@rapiq/adapter-typeorm';
import {
    collectNonLeadingQueryKeys,
    collectUncoveredColumns,
    toMetadataOnlyDataSourceOptions,
} from '@privateaim/server-test-kit';
import type { EntityTarget } from 'typeorm';
import { DataSource } from 'typeorm';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import {
    EventEntity,
} from '../../../../src/adapters/database/index.ts';
import {
    decodeQuery,
    entitySchemas,
    eventSchema,
} from '../../../../src/core/index.ts';
import { DataSourceOptionsBuilder } from '../../../../src/app/modules/database/index.ts';

/**
 * Plan 017 guard — see the twin in server-core. A rapiq schema's allow-lists are
 * strings the compiler only checks against the domain TYPE, never against the
 * entity metadata, so a stale key surfaces at runtime or silently drops a field
 * from every collection response.
 */
const SCHEMA_ENTITY_TARGETS: [string, any, EntityTarget<any>][] = [
    ['event', eventSchema, EventEntity],
];

describe('core/query (schema ↔ entity parity)', () => {
    let dataSource: DataSource;

    beforeAll(async () => {
        dataSource = new DataSource(
            toMetadataOnlyDataSourceOptions(new DataSourceOptionsBuilder().buildWith({
                type: 'better-sqlite3',
                database: ':memory:',
            })),
        );

        await dataSource.initialize();
    });

    afterAll(async () => {
        if (dataSource?.isInitialized) {
            await dataSource.destroy();
        }
    });

    // SCHEMA_ENTITY_TARGETS is hand-maintained, so without this a schema added
    // later would silently go unguarded rather than fail.
    it('should cover every schema in the registry', () => {
        expect(SCHEMA_ENTITY_TARGETS.map(([, schema]) => schema.name).sort())
            .toEqual(entitySchemas.map((schema) => schema.name).sort());
    });

    // The other direction, which `assertSchemaMatchesEntity` does not check: a
    // column in neither `fields.default` nor `fields.allowed` is silently absent
    // from every response, because rapiq derives the root projection from
    // `fields`. No error is raised — the property just never appears.
    it.each(SCHEMA_ENTITY_TARGETS)('should expose every %s column through fields', (_name, schema, target) => {
        expect(collectUncoveredColumns(schema, dataSource.getMetadata(target))).toEqual([]);
    });

    // Since rapiq 2.1 this also verifies the schema's `indexes` declarations:
    // every declared sequence must be a leftmost prefix of the entity's PK, a
    // unique, or an @Index (property names).
    it.each(SCHEMA_ENTITY_TARGETS)('should resolve every %s schema key against the entity', (_name, schema, target) => {
        expect(() => assertSchemaMatchesEntity(schema, target, dataSource)).not.toThrow();
    });

    /**
     * The invariant the index declarations rest on (#1842): every allowed
     * filter key and every allowed sort key must LEAD a declared index.
     *
     * Anchor mode requires one conjunct per AND group to lead an index, and a
     * sort key list must equal a leftmost prefix of one index — so a key that
     * leads nothing is rejected the moment a client filters or sorts by it
     * alone, even though the allow-list permits it. Together with the
     * backing assertion above, a green run here means enforcement can never
     * reject a query the allow-lists advertise.
     */
    describe('indexed invariant', () => {
        it.each(entitySchemas.map((schema) => [schema.name, schema] as const))(
            'should let every allowed %s query key lead a declared index',
            (_name, schema) => {
                expect(collectNonLeadingQueryKeys(schema.describe())).toEqual([]);
            },
        );

        /**
         * Guards the check above against passing vacuously. It reads the
         * allow-lists off the schema DESCRIPTION, so a renamed description key
         * would yield `undefined`, the loop would never run and the invariant
         * would report green while checking nothing — exactly what the `sort`
         * to `sorts` rename in rapiq 2.1.0 did. Asserted PER SCHEMA: over the
         * flattened set, the other schemas would keep the count positive while
         * one schema's block went missing. Array.isArray is the load-bearing
         * shape — `undefined` passes a `.not.toBeNull()`, and only an array
         * proves the list is there for the loops to iterate.
         */
        it.each(['filters', 'sorts'] as const)('should describe an %s allow-list for every schema', (parameter) => {
            const missing = entitySchemas
                .map((schema) => schema.describe())
                .filter((description) => !Array.isArray(description[parameter]?.allowed))
                .map((description) => description.name);

            expect(missing).toEqual([]);
        });

        it('should describe indexes for every schema', () => {
            const missing = entitySchemas
                .map((schema) => schema.describe())
                .filter((description) => !Array.isArray(description.indexes))
                .map((description) => description.name);

            expect(missing).toEqual([]);
        });

        // The policy OPT-IN, which nothing else pins: deleting `indexed: true`
        // from a schema keeps the invariant green (the indexes are still
        // declared), keeps `assertSchemaMatchesEntity` green and keeps every
        // wire probe answering 200 — enforcement is just silently off, the
        // exact state #1842 exists to prevent. `describe()` normalizes the
        // opt-in to 'anchor' / true, and to false when it is absent.
        it('should keep the indexed policies switched on for every schema', () => {
            const offenders = entitySchemas
                .map((schema) => schema.describe())
                .filter((description) => description.filters?.indexed !== 'anchor' ||
                    description.sorts?.indexed !== true)
                .map((description) => description.name);

            expect(offenders).toEqual([]);
        });

        it('should have allow-listed keys to check at all', () => {
            const keys = entitySchemas.flatMap((schema) => {
                const description = schema.describe();

                return [
                    ...description.filters?.allowed || [],
                    ...description.sorts?.allowed || [],
                ];
            });

            expect(keys.length).toBeGreaterThan(0);
        });

        /**
         * A schema with no `sorts` allow-list falls back to rapiq's syntactic
         * name check, so an arbitrary root key survives decode and reaches
         * `ORDER BY` as a nonexistent column — a driver rejection mapped to a
         * 500, where a declaring schema fails soft and falls back to
         * `sorts.default` (or to no ordering when none is declared). Asserted
         * per schema rather than per endpoint, so the next schema that
         * forgets the block is still guarded.
         */
        it.each(entitySchemas.map((schema) => [schema.name, schema] as const))(
            'should strip an unknown sort key for %s',
            (_name, schema) => {
                const description = schema.describe();
                const allowed = description.sorts?.allowed || [];

                // The positive control. The assertion below only proves an
                // ABSENCE, so it passes vacuously the moment sort keys stop
                // being decoded at all — one wire-key rename away. Decoding a
                // key the schema allows proves the pipeline under test is
                // live for THIS schema. Probed in the direction OPPOSITE the
                // key's `sorts.default` entry (server-core's decode-pin
                // technique): a dropped parameter is silently replaced by the
                // default, which carries the same key NAME — only the
                // direction separates a bound entry from the substituted
                // default.
                const [permitted] = allowed;
                expect(permitted, 'schema declares no sort key to control against').toBeDefined();

                const defaults = description.sorts?.default || {};
                const direction = defaults[permitted] === 'DESC' ? 'ASC' : 'DESC';
                const wire = direction === 'DESC' ? `-${permitted}` : permitted;

                const control = decodeQuery({ sort: wire }, { schema });
                const bound = (control.sorts?.value || [])
                    .some((sort) => sort.name === permitted && sort.operator === direction);
                expect(bound).toBe(true);

                const parsed = decodeQuery({ sort: 'totallyBogusColumn' }, { schema });
                expect(JSON.stringify(parsed.sorts ?? null)).not.toContain('totallyBogusColumn');
            },
        );
    });
});
