/*
 * Copyright (c) 2023-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { faker } from '@faker-js/faker';
import { ProcessStatus } from '@privateaim/kit';
import {
    and,
    contains,
    eq,
    or,
} from '@rapiq/core';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { MasterImageEntity } from '../../../src/adapters/database/entities/index.ts';
import { createTestApplication } from '../../app';

describe('src/controllers/core/master-image', () => {
    const suite = createTestApplication();

    // unique per run, so the assertions ignore rows other specs created
    const group = faker.string.alpha({ length: 12, casing: 'lower' });

    beforeAll(async () => {
        await suite.setup();

        const repository = suite.dataSource.getRepository(MasterImageEntity);
        const rows = [
            { name: 'base', buildStatus: ProcessStatus.EXECUTED },
            { name: 'tensorflow', buildStatus: ProcessStatus.FAILED },
            { name: 'pytorch', buildStatus: ProcessStatus.STARTED },
            { name: 'sklearn', buildStatus: ProcessStatus.STARTING },
            { name: 'lightgbm', buildStatus: null },
        ];

        await repository.save(rows.map((row) => repository.create({
            name: row.name,
            buildStatus: row.buildStatus,
            groupVirtualPath: group,
            path: `${group}/${row.name}`,
            virtualPath: `${group}/${row.name}`,
        })));
    });

    afterAll(async () => {
        await suite.teardown();
    });

    it('should read collection', async () => {
        const { client } = suite;

        const { data } = await client.masterImage.getMany();

        expect(data.length).toBeGreaterThanOrEqual(0);
    });

    it('should find an image by a partial path', async () => {
        const { data } = await suite.client.masterImage.getMany({
            // the shape FSearch sends with MASTER_IMAGE_SEARCH_FIELDS
            filters: and(
                eq('groupVirtualPath', group),
                or(contains('name', 'tens'), contains('virtualPath', 'tens')),
            ),
        });

        expect(data.map((el) => el.virtualPath)).toEqual([`${group}/tensorflow`]);
    });

    it('should narrow the collection by build status', async () => {
        const failed = await suite.client.masterImage.getMany({
            filters: {
                groupVirtualPath: group,
                buildStatus: ProcessStatus.FAILED,
            },
        });

        expect(failed.data.map((el) => el.name)).toEqual(['tensorflow']);

        const building = await suite.client.masterImage.getMany({
            filters: {
                groupVirtualPath: group,
                buildStatus: [ProcessStatus.STARTING, ProcessStatus.STARTED],
            },
            sorts: { name: 'ASC' },
        });

        expect(building.data.map((el) => el.name)).toEqual(['pytorch', 'sklearn']);
    });
});
