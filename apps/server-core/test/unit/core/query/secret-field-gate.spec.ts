/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { toMetadataOnlyDataSourceOptions } from '@privateaim/server-test-kit';
import { DataSource } from 'typeorm';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { entitySchemas } from '../../../../src/core/index.ts';
import { DataSourceOptionsBuilder } from '../../../../src/app/modules/database/index.ts';

/**
 * A relation fieldset is selected explicitly by the typeorm adapter, bypassing
 * `select: false`, and never reaches the owning service's gate. Every
 * `select: false` column must therefore be root-only in its entity's schema
 * (`createRootOnlyFieldsGate`), or `include=<relation>&fields[<relation>]=+<column>`
 * serves it to any caller. Derived from the entity metadata, so a new secret
 * column fails here until its schema gates it.
 */
describe('core/query (select:false columns are root-only)', () => {
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

    it('should gate every select:false column to the root of its schema', async () => {
        const hidden = dataSource.entityMetadatas.flatMap((metadata) => metadata.columns
            .filter((column) => column.isSelect === false)
            .map((column) => ({ entity: metadata.targetName, field: column.propertyName })));

        expect(hidden.length).toBeGreaterThan(0);

        for (const { entity, field } of hidden) {
            // `registryProject` -> `RegistryProjectEntity`
            const schema = entitySchemas.find(
                (candidate) => `${candidate.name.charAt(0).toUpperCase()}${candidate.name.slice(1)}Entity` === entity,
            );

            expect(schema, `no schema for ${entity}`).toBeDefined();

            expect(await schema.fields.validate(field, undefined, ''), `${entity}.${field} at the root`).toBeTruthy();
            expect(await schema.fields.validate(field, undefined, 'relation'), `${entity}.${field} through a relation`).toBeFalsy();
        }
    });
});
