/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterAll, beforeAll, describe, expect, it,
} from 'vitest';
import type { Project } from '@privateaim/core-kit';
import {
    createTestSuite,
    expectProperties,
    removeDateProperties,
} from '../../utils';
import { createTestProject } from '../../utils/domains';

describe('src/controllers/core/project', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    let details : Project;

    it('should create resource', async () => {
        const client = suite.client();

        const project = await client.project.create(createTestProject());
        expect(project.id).toBeDefined();

        details = removeDateProperties(project);
    });

    it('should read collection', async () => {
        const client = suite.client();

        const { data } = await client.project.getMany();
        expect(data.length).toBeGreaterThanOrEqual(1);
    });

    it('should read resource', async () => {
        const client = suite.client();

        const data = await client.project.getOne(details.id);
        expectProperties(details, data);
    });

    it('should update resource', async () => {
        const client = suite.client();

        details.name = 'TestA';

        const data = await client.project.update(details.id, details);
        expectProperties(details, data);
    });

    it('should delete resource', async () => {
        const client = suite.client();

        await client.project.delete(details.id);
    });
});
