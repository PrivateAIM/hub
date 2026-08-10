/*
 * Copyright (c) 2021-2024.
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
import { createTestApplication } from '../../app';
import type { ProjectNode } from '@privateaim/core-kit';
import { ProjectNodeApprovalStatus } from '@privateaim/core-kit';
import {  expectProperties } from '../../utils';
import { createTestNode, createTestProject } from '../../utils/domains';

describe('src/controllers/core/project-node', () => {
    const suite = createTestApplication();

    beforeAll(async () => {
        await suite.setup();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    let details : ProjectNode;

    it('should create resource', async () => {
        const { client } = suite;

        const { data: project } = await client.project.create(createTestProject());
        expect(project.id).toBeDefined();

        const { data: node } = await client.node.create(createTestNode());
        expect(node.id).toBeDefined();

        details = (await client.projectNode.create({
            nodeId: node.id,
            projectId: project.id,
        })).data;
    });

    it('should read collection', async () => {
        const { client } = suite;

        const { data } = await client.projectNode.getMany();
        expect(data.length).toBeGreaterThanOrEqual(1);
    });

    it('should read resource', async () => {
        const { client } = suite;

        const { data } = await client.projectNode.getOne(details.id);
        expectProperties(details, data);
    });

    it('should filter collection by approval status', async () => {
        const { client } = suite;

        // The row's status depends on the approval-skip env, so pin the
        // filter against whatever it actually is — including the pending
        // (`null` => IS NULL) form the inbox segments rely on.
        const { data: current } = await client.projectNode.getOne(details.id);

        const matching = await client.projectNode.getMany({ filters: { approvalStatus: current.approvalStatus } });
        expect(matching.data.map((item) => item.id)).toContain(details.id);

        const nonMatching = await client.projectNode.getMany({
            filters: {
                approvalStatus: current.approvalStatus === null ?
                    ProjectNodeApprovalStatus.APPROVED :
                    null,
            },
        });
        expect(nonMatching.data.map((item) => item.id)).not.toContain(details.id);
    });

    it('should delete resource', async () => {
        const { client } = suite;

        await client.projectNode.delete(details.id);
    });
});
