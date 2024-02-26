/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { BucketEntity } from '../../src/domains';
import {
    dropTestDatabase,
    expectPropertiesEqualToSrc,
    removeDateProperties,
    useSuperTest,
    useTestDatabase,
} from '../utils';

describe('controllers/bucket', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    let details : BucketEntity;

    it('should create resource', async () => {
        const response = await superTest
            .post('/buckets')
            .send({
                name: 'foo-bar-baz',
                region: 'eu-west',
            })
            .auth('admin', 'start123');

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();
        expect(response.body.name).toEqual('foo-bar-baz');
        expect(response.body.region).toEqual('eu-west');

        details = removeDateProperties(response.body);
    });

    it('should get collection', async () => {
        const response = await superTest
            .get('/buckets')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/buckets/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/buckets/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
