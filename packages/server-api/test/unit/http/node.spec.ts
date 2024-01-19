/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Node,
} from '@personalhealthtrain/core';
import { removeDateProperties } from '../../utils';
import { expectPropertiesEqualToSrc } from '../../utils';
import { useSuperTest } from '../../utils';
import { dropTestDatabase, useTestDatabase } from '../../utils';
import { createSuperTestNode } from '../../utils/domains';

describe('src/controllers/core/station', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    let details: Node;

    it('should create node', async () => {
        const response = await createSuperTestNode(superTest);

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();

        details = removeDateProperties(response.body);
    });

    it('should read collection', async () => {
        const response = await superTest
            .get('/nodes')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/nodes/${details.id}?fields=%2Bemail`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should update resource', async () => {
        details.name = 'TestA';

        const response = await superTest
            .post(`/nodes/${details.id}`)
            .send(details)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/nodes/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
