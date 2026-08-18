/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { assertSchemaMatchesEntity } from '@rapiq/adapter-typeorm';
import { collectUncoveredColumns, toMetadataOnlyDataSourceOptions } from '@privateaim/server-test-kit';
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
});
