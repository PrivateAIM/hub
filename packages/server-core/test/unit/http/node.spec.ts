/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Node,
} from '@privateaim/core-kit';
import {
    createTestSuite,
    expectProperties,
    removeDateProperties,
} from '../../utils';
import { createTestNode } from '../../utils/domains';

describe('src/controllers/core/node', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    let details: Node;

    it('should create node', async () => {
        const client = suite.client();

        const node = await client.node.create(createTestNode());
        expect(node.id).toBeDefined();

        details = removeDateProperties(node);
    });

    it('should read collection', async () => {
        const client = suite.client();

        const { data } = await client.node.getMany();
        expect(data.length).toBeGreaterThanOrEqual(1);
    });

    it('should read resource', async () => {
        const client = suite.client();

        const data = await client.node.getOne(details.id);
        expectProperties(details, data, {
            keysExcluded: ['robot_id'],
        });
    });

    it('should update resource', async () => {
        const client = suite.client();

        details.name = 'TestA';

        const data = await client.node.update(details.id, details);

        expectProperties(details, data);
    });

    it('should delete resource', async () => {
        const client = suite.client();

        await client.node.delete(details.id);
    });
});
