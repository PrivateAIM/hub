/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { assertSchemaMatchesEntity } from '@rapiq/adapter-typeorm';
import { collectNonLeadingQueryKeys, collectUncoveredColumns, toMetadataOnlyDataSourceOptions } from '@privateaim/server-test-kit';
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
    AnalysisBucketEntity,
    AnalysisBucketFileEntity,
    AnalysisEntity,
    AnalysisNodeEntity,
    AnalysisNodeEventEntity,
    MasterImageEntity,
    MasterImageGroupEntity,
    NodeEntity,
    ProjectEntity,
    ProjectNodeEntity,
    RegistryEntity,
    RegistryProjectEntity,
} from '../../../../src/adapters/database/index.ts';
import {
    analysisBucketFileSchema,
    analysisBucketSchema,
    analysisNodeEventSchema,
    analysisNodeSchema,
    analysisSchema,
    entitySchemas,
    masterImageGroupSchema,
    masterImageSchema,
    nodeSchema,
    projectNodeSchema,
    projectSchema,
    registryProjectSchema,
    registrySchema,
} from '../../../../src/core/index.ts';
import { DataSourceOptionsBuilder } from '../../../../src/app/modules/database/index.ts';

/**
 * Plan 017 guard for the OTHER half of the rename: a rapiq schema is a set of
 * string allow-lists (`fields`, `filters`, `sorts`, `relations`) that the compiler
 * only checks against the domain TYPE, never against the entity metadata. A key
 * that resolves against neither does not error — a stale `filters.allowed` entry
 * surfaces as a runtime "key is not permitted", and a field missing from
 * `fields` silently vanishes from every collection response.
 *
 * `analysisLogSchema` / `analysisNodeLogSchema` are deliberately absent: they are
 * backed by VictoriaLogs, not by a TypeORM entity.
 */
const SCHEMA_ENTITY_TARGETS: [string, any, EntityTarget<any>][] = [
    ['analysis', analysisSchema, AnalysisEntity],
    ['analysisBucket', analysisBucketSchema, AnalysisBucketEntity],
    ['analysisBucketFile', analysisBucketFileSchema, AnalysisBucketFileEntity],
    ['analysisNode', analysisNodeSchema, AnalysisNodeEntity],
    ['analysisNodeEvent', analysisNodeEventSchema, AnalysisNodeEventEntity],
    ['masterImage', masterImageSchema, MasterImageEntity],
    ['masterImageGroup', masterImageGroupSchema, MasterImageGroupEntity],
    ['node', nodeSchema, NodeEntity],
    ['project', projectSchema, ProjectEntity],
    ['projectNode', projectNodeSchema, ProjectNodeEntity],
    ['registry', registrySchema, RegistryEntity],
    ['registryProject', registryProjectSchema, RegistryProjectEntity],
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
    it.each(SCHEMA_ENTITY_TARGETS)('should resolve every %s schema key against the entity', (_name, schema, target) => {
        expect(() => assertSchemaMatchesEntity(schema, target, dataSource)).not.toThrow();
    });

    // Issue #1842 invariant, over the DESCRIPTION (the normalized shape the
    // indexed policies actually read): every allow-listed filter/sort key must
    // LEAD a declared index sequence, or anchor-mode enforcement rejects a
    // query the allow-lists themselves advertise. `assertSchemaMatchesEntity`
    // above guards the other half — that every declared sequence is backed by
    // a real PK/unique/index on the entity.
    it.each(SCHEMA_ENTITY_TARGETS)('should let every %s allowed filter and sort key lead a declared index', (_name, schema) => {
        expect(collectNonLeadingQueryKeys(schema.describe())).toEqual([]);
    });

    // Anti-vacuity guards (authup's indexed-invariant.spec.ts pattern): the
    // invariant loops read the description, so a renamed description key —
    // exactly what the `sort` → `sorts` rename in rapiq 2.1 did — would make
    // them silently check nothing. Array.isArray is the load-bearing shape:
    // a rename yields `undefined`, which passes `.not.toBeNull()` — only an
    // array proves the list is there for the loops to iterate.
    it.each(SCHEMA_ENTITY_TARGETS)('should describe filters, sorts and indexes for %s', (_name, schema) => {
        const description = schema.describe();

        expect(Array.isArray(description.filters?.allowed)).toBe(true);
        expect(Array.isArray(description.sorts?.allowed)).toBe(true);
        expect(Array.isArray(description.indexes)).toBe(true);

        // The policy OPT-IN, which nothing else pins: deleting `indexed: true`
        // from a schema keeps the invariant above green (the indexes are still
        // declared), keeps `assertSchemaMatchesEntity` green and keeps every
        // wire probe answering 200 — enforcement is just silently off, the
        // exact state #1842 exists to prevent. `describe()` normalizes the
        // opt-in to 'anchor' / true, and to false when it is absent.
        expect(description.filters?.indexed).toBe('anchor');
        expect(description.sorts?.indexed).toBe(true);
    });

    it('should have allow-listed keys to check at all', () => {
        const keys = SCHEMA_ENTITY_TARGETS.flatMap(([, schema]) => {
            const description = schema.describe();

            return [
                ...(description.filters?.allowed || []),
                ...(description.sorts?.allowed || []),
            ];
        });

        expect(keys.length).toBeGreaterThan(0);
    });
});
