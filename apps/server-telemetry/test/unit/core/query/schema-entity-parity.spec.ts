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
    EventEntity,
} from '../../../../src/adapters/database/index.ts';
import {
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
