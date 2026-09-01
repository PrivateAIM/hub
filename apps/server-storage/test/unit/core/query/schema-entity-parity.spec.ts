/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { SchemaEntityIndexMismatchError, assertSchemaMatchesEntity } from '@rapiq/adapter-typeorm';
import { defineSchema } from '@rapiq/core';
import {
    collectNonLeadingQueryKeys,
    collectUncoveredColumns,
    toMetadataOnlyDataSourceOptions,
} from '@privateaim/server-test-kit';
import type { Bucket } from '@privateaim/storage-kit';
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
    BucketEntity,
    BucketFileEntity,
} from '../../../../src/adapters/database/index.ts';
import {
    bucketFileSchema,
    bucketSchema,
    entitySchemas,
} from '../../../../src/core/index.ts';
import { DataSourceOptionsBuilder } from '../../../../src/app/modules/database/index.ts';

/**
 * Plan 017 guard — see the twin in server-core. A rapiq schema's allow-lists are
 * strings the compiler only checks against the domain TYPE, never against the
 * entity metadata, so a stale key surfaces at runtime or silently drops a field
 * from every collection response.
 */
const SCHEMA_ENTITY_TARGETS: [string, any, EntityTarget<any>][] = [
    ['bucket', bucketSchema, BucketEntity],
    ['bucketFile', bucketFileSchema, BucketFileEntity],
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
        expect(entitySchemas.length).toBeGreaterThan(0);
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
    it.each(SCHEMA_ENTITY_TARGETS)('should resolve every %s schema key against the entity', (_name, schema, target) => {
        expect(() => assertSchemaMatchesEntity(schema, target, dataSource)).not.toThrow();
    });

    /**
     * Issue #1842 invariant: every allow-listed filter and sort key must LEAD a
     * declared `indexes` sequence. Anchor-mode filters require one conjunct per
     * AND group to lead a declared index and indexed sorts must equal a
     * leftmost prefix of one — so a key that leads nothing makes enforcement
     * reject (filters, a hard 400) or drop (sorts, silently unsorted) a query
     * the allow-lists themselves advertise. `assertSchemaMatchesEntity` above
     * guards the other half (every declared sequence is backed by a real
     * entity structure); together the two make the allow-lists, the
     * declarations and the database agree.
     */
    it.each(SCHEMA_ENTITY_TARGETS)('should let every %s filter and sort key lead a declared index', (_name, schema) => {
        expect(collectNonLeadingQueryKeys(schema.describe())).toEqual([]);
    });

    /**
     * Guards the invariant above against passing vacuously. It reads the
     * allow-lists off the schema DESCRIPTION and iterates them, so a renamed
     * description key yields `undefined`, the loops never run and the
     * invariant reports green while checking nothing — exactly what the
     * `sort` to `sorts` rename in rapiq 2.1.0 did to authup. Pinned PER
     * SCHEMA: over the flattened set, the other schemas would keep the count
     * positive while one schema's block went missing. Array.isArray is the
     * load-bearing shape — `undefined` passes a `.not.toBeNull()`, and only
     * an array proves the list is there for the loops to iterate.
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
    // declared), keeps `assertSchemaMatchesEntity` green and keeps every wire
    // probe answering 200 — enforcement is just silently off, the exact state
    // #1842 exists to prevent. `describe()` normalizes the opt-in to
    // 'anchor' / true, and to false when it is absent.
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
     * Negative control for the index phase of `assertSchemaMatchesEntity`
     * (issue #1842): proves the not-to-throw assertions above are exercised by
     * a version of rapiq that actually CHECKS declared indexes — otherwise
     * they would pass vacuously against a build where the phase is missing.
     * `['name', 'actorId']` is unbacked by design: BucketEntity carries only
     * single-column indexes (plus the PK), so no backing sequence has this
     * two-key leftmost prefix. The throwaway schema is deliberately never
     * registered anywhere.
     */
    it('should reject a declared index sequence the entity does not back', () => {
        const throwaway = defineSchema<Bucket>({
            name: 'bucketUnbackedIndexControl',
            indexes: [['name', 'actorId']],
        });

        expect(() => assertSchemaMatchesEntity(throwaway, BucketEntity, dataSource))
            .toThrow(SchemaEntityIndexMismatchError);
    });

    /**
     * Negative control for the OTHER half, `collectNonLeadingQueryKeys`: every
     * runtime call site asserts an ABSENCE (`toEqual([])`), so a loosened
     * helper — `sequence[0]` widened to `sequence.includes`, a dropped sorts
     * loop, `leading` seeded from the allow-list itself — would keep all of
     * them green forever while the invariant silently stopped being checked.
     * A literal description with keys that lead nothing proves the helper
     * still reports offenders, in exactly the documented spelling.
     */
    it('should report a filter and sort key that leads no declared index', () => {
        expect(collectNonLeadingQueryKeys({
            indexes: [['a']],
            filters: { allowed: ['a', 'b'] },
            sorts: { allowed: ['c'] },
        })).toEqual(['filters.b', 'sorts.c']);

        // the documented empty-indexes branch: no declared sequence makes
        // EVERY allowed key an offender
        expect(collectNonLeadingQueryKeys({ filters: { allowed: ['a'] } }))
            .toEqual(['filters.a']);
    });
});
