/*
 * Copyright (c) 2021-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import { createNanoID } from '@privateaim/kit';
import { isClientError } from 'hapic';
import { EntityRelationLookupError } from 'typeorm-extension';
import {
    createTestSuite,
    expectSrcProperties,
    removeDateProperties,
} from '../../../utils';
import { TEST_DEFAULT_ANALYSIS } from '../../../utils/domains';

describe('src/controllers/core/analysis', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    let details : Analysis;

    it('should create resource', async () => {
        const client = suite.client();

        const project = await client.project.create({
            name: 'development',
        });
        const analysis = await client.analysis.create({
            ...TEST_DEFAULT_ANALYSIS,
            project_id: project.id,
        });

        expect(analysis.project_id).toEqual(project.id);

        details = removeDateProperties(analysis);
    });

    it('should get collection', async () => {
        const client = suite.client();
        const { data } = await client.analysis.getMany();

        expect(data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const client = suite.client();
        const data = await client.analysis.getOne(details.id);

        expectSrcProperties(details, data);
    });

    it('should update resource', async () => {
        const client = suite.client();
        details.name = 'TestA';

        const data = await client.analysis.update(details.id, details);

        expectSrcProperties(details, data);
    });

    it('should delete resource', async () => {
        const client = suite.client();
        const response = await client.analysis.delete(details.id);
        expect(response).toBeDefined();
    });

    it('should not create resource with invalid project', async () => {
        expect.assertions(1);

        const client = suite.client();

        try {
            await client.analysis.create({
                ...details,
                project_id: '28eb7728-c78d-4c2f-ab99-dc4bcee78da9',
            });
        } catch (e) {
            if (isClientError(e)) {
                expect(e.response.data.message).toEqual(EntityRelationLookupError.notFound('project', ['project_id']).message);
                return;
            }

            throw e;
        }
    });

    it('should not create resource with invalid master-image', async () => {
        expect.assertions(1);

        const client = suite.client();

        const project = await client.project.create({
            name: createNanoID(),
        });

        try {
            await client.analysis.create({
                ...details,
                project_id: project.id,
                master_image_id: '28eb7728-c78d-4c2f-ab99-dc4bcee78da9',
            });
        } catch (e) {
            if (isClientError(e)) {
                expect(e.response.data.message).toEqual(EntityRelationLookupError.notFound('master_image', ['master_image_id']).message);
                return;
            }

            throw e;
        }
    });
});
