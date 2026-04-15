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
import type {
    Node,
} from '@privateaim/core-kit';
import { createTestApplication } from '../../app';
import {
    expectProperties,
    removeDateProperties,
} from '../../utils';
import { createTestNode } from '../../utils/domains';

describe('src/controllers/core/node', () => {
    const suite = createTestApplication();

    beforeAll(async () => {
        await suite.setup();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    let details: Node;

    it('should create node', async () => {
        const { client } = suite;

        const node = await client.node.create(createTestNode());
        expect(node.id).toBeDefined();

        details = removeDateProperties(node);
    });

    it('should read collection', async () => {
        const { client } = suite;

        const { data } = await client.node.getMany();
        expect(data.length).toBeGreaterThanOrEqual(1);
    });

    it('should read resource', async () => {
        const { client } = suite;

        const data = await client.node.getOne(details.id);
        expectProperties(details, data, { keysExcluded: ['robot_id'] });
    });

    it('should update resource', async () => {
        const { client } = suite;

        details.name = 'TestA';

        const data = await client.node.update(details.id, details);

        expectProperties(details, data);
    });

    it('should delete resource', async () => {
        const { client } = suite;

        await client.node.delete(details.id);
    });
});
