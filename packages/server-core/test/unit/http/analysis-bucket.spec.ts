/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterAll, beforeAll, describe, expect, it,
} from 'vitest';
import type { AnalysisBucket } from '@privateaim/core-kit';
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

describe('controllers/analysis-file', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    let details : AnalysisBucket;

    it('should create resource', async () => {
        const client = suite.client();

        const project = await client.project.create(createTestProject());
        expect(project.id).toBeDefined();

        const analysis = await client.analysis.create({
            project_id: project.id,
        });
        expect(analysis.id).toBeDefined();

        const analysisBucket = await client.analysisBucket.create({
            analysis_id: analysis.id,
            bucket_id: randomUUID(),
            type: AnalysisBucketType.CODE,
        });

        details = removeDateProperties(analysisBucket);
    });

    it('should read collection', async () => {
        const client = suite.client();

        const { data } = await client.analysisBucket.getMany();
        expect(data.length).toBeGreaterThanOrEqual(1);
    });

    it('should read resource', async () => {
        const client = suite.client();

        const data = await client.analysisBucket.getOne(details.id);
        expectProperties(details, data);
    });

    it('should delete resource', async () => {
        const client = suite.client();

        await client.analysisBucket.delete(details.id);
    });
});
