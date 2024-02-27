/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import tar from 'tar-stream';
import type { BucketFileEntity } from '../../src/domains';
import {
    dropTestDatabase,
    expectPropertiesEqualToSrc,
    removeDateProperties,
    useSuperTest,
    useTestDatabase,
} from '../utils';
import { createTestBucket } from '../utils/domains';

describe('controllers/bucket-file', () => {
    const superTest = useSuperTest();

    beforeAll(async () => {
        await useTestDatabase();
    });

    afterAll(async () => {
        await dropTestDatabase();
    });

    let details : BucketFileEntity;

    it('should create resource', async () => {
        const bucketResponse = await createTestBucket(superTest);

        const filePath = path.join(__dirname, '..', 'data', 'file.json');
        const response = await superTest
            .post(`/buckets/${bucketResponse.body.id}/upload`)
            .set('Accept', 'application/json')
            .set('Connection', 'keep-alive')
            .attach('file[0]', filePath)
            .auth('admin', 'start123');

        expect(response.status).toEqual(201);
        expect(response.body).toBeDefined();
        expect(response.body.meta).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toHaveLength(1);

        details = removeDateProperties((response.body.data as any[])[0]);
    });

    it('should get collection', async () => {
        const response = await superTest
            .get('/bucket-files')
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.length).toEqual(1);
    });

    it('should read resource', async () => {
        const response = await superTest
            .get(`/bucket-files/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();

        expectPropertiesEqualToSrc(details, response.body);
    });

    it('should stream resource', async () => {
        const response = await superTest
            .get(`/bucket-files/${details.id}/stream`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(200);
        expect(response.body).toBeDefined();
        expect((response.body as Buffer).byteLength).toBeGreaterThan(0);
    });

    it('should stream resource collection', (done) => {
        const extract = tar.extract();

        const headers : Record<string, any>[] = [];

        extract.on('entry', async (header, stream, callback) => {
            headers.push(header);

            callback();
        });

        extract.on('finish', () => {
            expect(headers.length).toBeGreaterThanOrEqual(1);
            done();
        });

        superTest
            .get(`/buckets/${details.bucket_id}/stream`)
            .auth('admin', 'start123')
            .pipe(extract);
    });

    it('should delete resource', async () => {
        const response = await superTest
            .delete(`/bucket-files/${details.id}`)
            .auth('admin', 'start123');

        expect(response.status).toEqual(202);
    });
});
