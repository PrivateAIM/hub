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

describe('core/query analysis include=masterImage', () => {
    let dataSource: DataSource;

    beforeAll(async () => {
        const options = new DataSourceOptionsBuilder().buildWith({
            type: 'better-sqlite3',
            database: ':memory:',
        });
        dataSource = new DataSource(options);
        await dataSource.initialize();
        await dataSource.synchronize();
        // isolate the analysis<->masterImage join under test; skip the wider FK graph
        await dataSource.query('PRAGMA foreign_keys = OFF');

        const miRepo = dataSource.getRepository(MasterImageEntity);
        const mi = await miRepo.save(miRepo.create({
            ...createTestMasterImage(),
            command: 'python main.py',
            commandArguments: [{ position: 'before', value: '--verbose' }],
        }));

        const anRepo = dataSource.getRepository(AnalysisEntity);
        await anRepo.save(anRepo.create(createTestAnalysis({
            masterImageId: mi.id,
            realmId: 'realm-1',
            projectId: 'project-1',
            imageCommandArguments: [{ position: 'after', value: '--fast' }],
        })));
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    it('hydrates the masterImage relation (incl. its json commandArguments) when included', async () => {
        const query = decodeQuery({ include: 'masterImage' }, { schema: analysisSchema });
        const repository = new AnalysisRepositoryAdapter(dataSource);

        const { data } = await repository.findMany(query);

        expect(data.length).toBe(1);
        expect(data[0].masterImageId).toBeDefined();
        expect(data[0].masterImage, 'masterImage relation should hydrate').toBeDefined();
        expect(data[0].masterImage.name).toEqual('base');
        expect(data[0].masterImage.command).toEqual('python main.py');
        // json column on the included relation — hydrated as a full subtree (rapiq beta.8)
        expect(data[0].masterImage.commandArguments).toEqual([{ position: 'before', value: '--verbose' }]);
    });

    it('projects the analysis json column imageCommandArguments', async () => {
        const query = decodeQuery({}, { schema: analysisSchema });
        const repository = new AnalysisRepositoryAdapter(dataSource);

        const { data } = await repository.findMany(query);

        expect(data.length).toBe(1);
        // json column on the root entity — now listable in fields (rapiq beta.8)
        expect(data[0].imageCommandArguments).toEqual([{ position: 'after', value: '--fast' }]);
    });
});
