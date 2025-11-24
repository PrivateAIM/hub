/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ProjectNode } from '@privateaim/core-kit';
import { createTestSuite, expectSrcProperties } from '../../utils';
import { createTestNode, createTestProject } from '../../utils/domains';

describe('src/controllers/core/project-node', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    let details : ProjectNode;

    it('should create resource', async () => {
        const client = suite.client();

        const project = await client.project.create(createTestProject());
        expect(project.id).toBeDefined();

        const node = await client.node.create(createTestNode());
        expect(node.id).toBeDefined();

        details = await client.projectNode.create({
            node_id: node.id,
            project_id: project.id,
        });
    });

    it('should read collection', async () => {
        const client = suite.client();

        const { data } = await client.projectNode.getMany();
        expect(data.length).toBeGreaterThanOrEqual(1);
    });

    it('should read resource', async () => {
        const client = suite.client();

        const data = await client.projectNode.getOne(details.id);
        expectSrcProperties(details, data);
    });

    it('should delete resource', async () => {
        const client = suite.client();

        await client.projectNode.delete(details.id);
    });
});
