/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    collectColumnNamingViolations,
    toMetadataOnlyDataSourceOptions,
} from '@privateaim/server-test-kit';
import { DataSource } from 'typeorm';
import {
    afterAll, 
    beforeAll, 
    describe, 
    expect, 
    it,
} from 'vitest';
import { DataSourceOptionsBuilder } from '../../../../src/app/modules/database/index.ts';

// Plan 017 guard. Options come from the PRODUCTION builder, so the entity list
// can never drift from what the service actually runs; only the driver is
// swapped for in-memory sqlite, which needs no external database.
describe('adapters/database (column naming)', () => {
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

    it('should map every entity property onto a snake_case column', () => {
        expect(dataSource.entityMetadatas.length).toBeGreaterThan(0);
        expect(collectColumnNamingViolations(dataSource)).toEqual([]);
    });
});
