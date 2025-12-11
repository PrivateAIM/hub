/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBucketFile } from '@privateaim/core-kit';
import { AnalysisBucketType } from '@privateaim/core-kit';
import { randomUUID } from 'node:crypto';
import {
    createTestSuite,
    expectProperties,
    removeDateProperties,
} from '../../utils';
import {
    createTestProject,
} from '../../utils/domains';

describe('controllers/analysis-bucket-file', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    let details : AnalysisBucketFile;

    it('should create resource', async () => {
        const client = suite.client();

        const project = await client.project.create(createTestProject());
        expect(project.id).toBeDefined();

        const analysis = await client.analysis.create({
            project_id: project.id,
        });
        expect(analysis.id).toBeDefined();

        const analysisBucket = await client.analysisBucket.create({
            bucket_id: randomUUID(),
            analysis_id: analysis.id,
            type: AnalysisBucketType.CODE,
        });
        expect(analysisBucket.id).toBeDefined();

        const analysisBucketFile = await client.analysisBucketFile.create({
            analysis_bucket_id: analysisBucket.id,
            bucket_file_id: '28eb7728-c78d-4c2f-ab99-dc4bcee78da9',
            name: 'foo.bar',
            root: false,
        });

        details = removeDateProperties(analysisBucketFile);
    });

    it('should read resource', async () => {
        const client = suite.client();

        const data = await client.analysisBucketFile.getOne(details.id);
        expectProperties(details, data);
    });

    it('should update resource', async () => {
        const client = suite.client();
        const data = await client.analysisBucketFile.update(details.id, {
            root: true,
        });

        expect(data.root).toBeTruthy();
    });

    it('should read collection', async () => {
        const client = suite.client();

        const { data } = await client.analysisBucketFile.getMany();
        expect(data.length).toEqual(1);
    });

    it('should delete resource', async () => {
        const client = suite.client();

        await client.analysisBucketFile.delete(details.id);
    });
});
