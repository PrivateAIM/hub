/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterAll, 
    beforeAll, 
    describe, 
    expect, 
    it,
} from 'vitest';
import { DataSource } from 'typeorm';
import { DataSourceOptionsBuilder } from '../../../../src/app/modules/database/index.ts';
import { AnalysisRepositoryAdapter } from '../../../../src/app/modules/database/repositories/analysis/repository.ts';
import { decodeQuery } from '../../../../src/core/query/index.ts';
import { analysisSchema } from '../../../../src/core/entities/analysis/schema.ts';
import {
    AnalysisEntity,
    MasterImageEntity,
} from '../../../../src/adapters/database/entities/index.ts';
import { createTestMasterImage } from '../../../utils/domains/master-image.ts';
import { createTestAnalysis } from '../../../utils/domains/analysis.ts';

describe('core/query analysis include=master_image', () => {
    let dataSource: DataSource;

    beforeAll(async () => {
        const options = new DataSourceOptionsBuilder().buildWith({
            type: 'better-sqlite3',
            database: ':memory:',
        });
        dataSource = new DataSource(options);
        await dataSource.initialize();
        await dataSource.synchronize();
        // isolate the analysis<->master_image join under test; skip the wider FK graph
        await dataSource.query('PRAGMA foreign_keys = OFF');

        const miRepo = dataSource.getRepository(MasterImageEntity);
        const mi = await miRepo.save(miRepo.create({
            ...createTestMasterImage(),
            command: 'python main.py',
            command_arguments: [{ position: 'before', value: '--verbose' }],
        }));

        const anRepo = dataSource.getRepository(AnalysisEntity);
        await anRepo.save(anRepo.create(createTestAnalysis({
            master_image_id: mi.id,
            realm_id: 'realm-1',
            project_id: 'project-1',
            image_command_arguments: [{ position: 'after', value: '--fast' }],
        })));
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    it('hydrates the master_image relation (incl. its json command_arguments) when included', async () => {
        const query = decodeQuery({ include: 'master_image' }, { schema: analysisSchema });
        const repository = new AnalysisRepositoryAdapter(dataSource);

        const { data } = await repository.findMany(query);

        expect(data.length).toBe(1);
        expect(data[0].master_image_id).toBeDefined();
        expect(data[0].master_image, 'master_image relation should hydrate').toBeDefined();
        expect(data[0].master_image.name).toEqual('base');
        expect(data[0].master_image.command).toEqual('python main.py');
        // json column on the included relation — hydrated as a full subtree (rapiq beta.8)
        expect(data[0].master_image.command_arguments).toEqual([{ position: 'before', value: '--verbose' }]);
    });

    it('projects the analysis json column image_command_arguments', async () => {
        const query = decodeQuery({}, { schema: analysisSchema });
        const repository = new AnalysisRepositoryAdapter(dataSource);

        const { data } = await repository.findMany(query);

        expect(data.length).toBe(1);
        // json column on the root entity — now listable in fields (rapiq beta.8)
        expect(data[0].image_command_arguments).toEqual([{ position: 'after', value: '--fast' }]);
    });
});
