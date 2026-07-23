/*
 * Copyright (c) 2026.
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
import path from 'node:path';
import fs from 'node:fs';
import { createAdminAuthorizationHeader } from '@privateaim/server-test-kit';
import {
    createTestSuite,
} from '../../utils/index.ts';
import { createTestBucket } from '../../utils/domains/index.ts';

describe('bucket HTTP endpoints', () => {
    const suite = createTestSuite();
    let authorization: string;

    beforeAll(async () => {
        await suite.up();
        authorization = await createAdminAuthorizationHeader();
    });

    afterAll(async () => {
        await suite.down();
    });

    let bucketId: string;
    let baseURL: string;

    function getBaseURL() {
        if (!baseURL) {
            baseURL = suite.client().getBaseURL().replace(/\/+$/, '');
        }
        return baseURL;
    }

    describe('POST /buckets', () => {
        it('should create bucket with 201 status', async () => {
            const input = createTestBucket({ region: 'eu-west' });

            const response = await fetch(`${getBaseURL()}/buckets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: authorization,
                },
                body: JSON.stringify(input),
            });

            expect(response.status).toBe(201);

            const body = await response.json();
            expect(body.id).toBeDefined();
            expect(body.name).toBe(input.name);
            expect(body.region).toBe('eu-west');

            bucketId = body.id;
        });

        it('should return bucket entity with id, name, region', async () => {
            const input = createTestBucket({ region: 'us-east' });

            const response = await fetch(`${getBaseURL()}/buckets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: authorization,
                },
                body: JSON.stringify(input),
            });

            const body = await response.json();
            expect(body.id).toBeDefined();
            expect(typeof body.id).toBe('string');
            expect(body.name).toBe(input.name);
            expect(body.region).toBe('us-east');
            expect(body.created_at).toBeDefined();
            expect(body.updated_at).toBeDefined();
        });
    });

    describe('GET /buckets', () => {
        it('should return collection with data and meta', async () => {
            const response = await fetch(`${getBaseURL()}/buckets`, { headers: { Authorization: authorization } });

            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body.data).toBeDefined();
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.meta).toBeDefined();
            expect(typeof body.meta.total).toBe('number');
            expect(body.data.length).toBeGreaterThanOrEqual(1);
        });

        it('should support pagination', async () => {
            const response = await fetch(`${getBaseURL()}/buckets?page[limit]=1&page[offset]=0`, { headers: { Authorization: authorization } });

            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body.data).toBeDefined();
            expect(body.data.length).toBeLessThanOrEqual(1);
            expect(body.meta).toBeDefined();
        });
    });

    describe('GET /buckets/:id', () => {
        it('should return single bucket', async () => {
            const response = await fetch(`${getBaseURL()}/buckets/${bucketId}`, { headers: { Authorization: authorization } });

            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body.id).toBe(bucketId);
            expect(body.name).toBeDefined();
            expect(body.region).toBe('eu-west');
        });

        it('should return 404 for non-existent bucket', async () => {
            const response = await fetch(`${getBaseURL()}/buckets/00000000-0000-0000-0000-000000000000`, { headers: { Authorization: authorization } });

            expect(response.status).toBeGreaterThanOrEqual(400);
        });
    });

    describe('GET /buckets/:id/stream', () => {
        let streamBucketId: string;

        it('should stream tar archive with Content-Disposition attachment', async () => {
            // Create a bucket and upload a file for streaming
            const input = createTestBucket();
            const createResponse = await fetch(`${getBaseURL()}/buckets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: authorization,
                },
                body: JSON.stringify(input),
            });
            const bucket = await createResponse.json();
            streamBucketId = bucket.id;

            const filePath = path.join(import.meta.dirname, '../../data/file.json');
            const fileContent = await fs.promises.readFile(filePath);
            const formData = new FormData();
            formData.append('file[0]', new Blob([fileContent]), 'test-stream.json');

            await fetch(`${getBaseURL()}/buckets/${streamBucketId}/upload`, {
                method: 'POST',
                headers: { Authorization: authorization },
                body: formData,
            });

            const response = await fetch(`${getBaseURL()}/buckets/${streamBucketId}/stream`, { headers: { Authorization: authorization } });

            expect(response.status).toBe(200);

            const contentDisposition = response.headers.get('content-disposition');
            expect(contentDisposition).toBeDefined();
            expect(contentDisposition).toContain('attachment');
            expect(contentDisposition).toContain('.tar');
        });

        it('should have Content-Type application/x-tar', async () => {
            const response = await fetch(`${getBaseURL()}/buckets/${streamBucketId}/stream`, { headers: { Authorization: authorization } });

            expect(response.status).toBe(200);

            const contentType = response.headers.get('content-type');
            expect(contentType).toBeDefined();
            expect(contentType).toContain('application/x-tar');
        });

        it('should contain uploaded files in tar', async () => {
            const response = await fetch(`${getBaseURL()}/buckets/${streamBucketId}/stream`, { headers: { Authorization: authorization } });

            expect(response.status).toBe(200);

            const body = await response.arrayBuffer();
            expect(body.byteLength).toBeGreaterThan(0);
        });
    });

    describe('POST /buckets/:id/upload', () => {
        it('should upload file with 201 status', async () => {
            const filePath = path.join(import.meta.dirname, '../../data/file.json');
            const fileContent = await fs.promises.readFile(filePath);
            const formData = new FormData();
            formData.append('file[0]', new Blob([fileContent]), 'upload-test.json');

            const response = await fetch(`${getBaseURL()}/buckets/${bucketId}/upload`, {
                method: 'POST',
                headers: { Authorization: authorization },
                body: formData,
            });

            expect(response.status).toBe(201);
        });

        it('should return created bucket files', async () => {
            const filePath = path.join(import.meta.dirname, '../../data/file.json');
            const fileContent = await fs.promises.readFile(filePath);
            const formData = new FormData();
            formData.append('file[0]', new Blob([fileContent]), 'upload-test-2.json');

            const response = await fetch(`${getBaseURL()}/buckets/${bucketId}/upload`, {
                method: 'POST',
                headers: { Authorization: authorization },
                body: formData,
            });

            const body = await response.json();
            expect(body.data).toBeDefined();
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.data.length).toBeGreaterThanOrEqual(1);
            expect(body.data[0].id).toBeDefined();
            expect(body.data[0].bucket_id).toBe(bucketId);
            expect(body.meta).toBeDefined();
            expect(body.meta.total).toBeGreaterThanOrEqual(1);
        });
    });

    describe('POST /buckets/:id (update)', () => {
        it('should update bucket with 202 status', async () => {
            const response = await fetch(`${getBaseURL()}/buckets/${bucketId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: authorization,
                },
                body: JSON.stringify({}),
            });

            expect(response.status).toBe(202);

            const body = await response.json();
            expect(body.id).toBe(bucketId);
        });
    });

    describe('DELETE /buckets/:id', () => {
        it('should delete bucket with 202 status', async () => {
            const response = await fetch(`${getBaseURL()}/buckets/${bucketId}`, {
                method: 'DELETE',
                headers: { Authorization: authorization },
            });

            expect(response.status).toBe(202);

            const body = await response.json();
            expect(body.id).toBe(bucketId);
        });

        it('should return 404 for non-existent bucket', async () => {
            const response = await fetch(`${getBaseURL()}/buckets/00000000-0000-0000-0000-000000000000`, {
                method: 'DELETE',
                headers: { Authorization: authorization },
            });

            expect(response.status).toBeGreaterThanOrEqual(400);
        });
    });
});
