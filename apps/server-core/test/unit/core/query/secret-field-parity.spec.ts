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
import { SECRET_FIELDS } from '../../../../src/core/index.ts';
import { DataSourceOptionsBuilder } from '../../../../src/app/modules/database/index.ts';

/**
 * `SECRET_FIELDS` is what `decodeQuery` refuses through a relation path. It is
 * hand-maintained, so a new `select: false` column would otherwise be served to
 * any caller via `include=<relation>&fields[<relation>]=+<column>` — the leak
 * the list exists to close. Every `select: false` column must be listed.
 */
describe('core/query (secret fields ↔ select:false parity)', () => {
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

    it('should list every select:false column', () => {
        const hidden = new Set<string>();
        for (const metadata of dataSource.entityMetadatas) {
            for (const column of metadata.columns) {
                if (column.isSelect === false) {
                    hidden.add(column.propertyName);
                }
            }
        }

        expect(hidden.size).toBeGreaterThan(0);
        expect([...SECRET_FIELDS].sort()).toEqual([...hidden].sort());
    });
});
