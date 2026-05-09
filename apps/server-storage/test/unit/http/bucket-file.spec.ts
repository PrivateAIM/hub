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
import {
    createTestSuite,
} from '../../utils/index.ts';
import { createTestBucket } from '../../utils/domains/index.ts';

describe('bucket-file HTTP endpoints', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    let bucketId: string;
    let fileId: string;
    let baseURL: string;

    function getBaseURL() {
        if (!baseURL) {
            baseURL = suite.client().getBaseURL().replace(/\/+$/, '');
        }
        return baseURL;
    }

    it('should setup bucket and upload file', async () => {
        const client = suite.client();

        const bucket = await client.bucket.create(createTestBucket());
        bucketId = bucket.id;

        const filePath = path.join(import.meta.dirname, '../../data/file.json');
        const fileContent = await fs.promises.readFile(filePath);
        const formData = new FormData();
        formData.append('file[0]', new Blob([fileContent]), 'test-file.json');

        const result = await client.bucket.upload(bucketId, formData);
        expect(result.data.length).toBe(1);
        fileId = result.data[0].id;
    });

    describe('GET /bucket-files', () => {
        it('should return collection with data and meta', async () => {
            const response = await fetch(`${getBaseURL()}/bucket-files`, { headers: { Authorization: 'Bearer test' } });

            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body.data).toBeDefined();
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.data.length).toBeGreaterThanOrEqual(1);
            expect(body.meta).toBeDefined();
            expect(typeof body.meta.total).toBe('number');
            expect(body.meta.total).toBeGreaterThanOrEqual(1);
        });
    });

    describe('GET /bucket-files/:id', () => {
        it('should return single bucket file', async () => {
            const response = await fetch(`${getBaseURL()}/bucket-files/${fileId}`, { headers: { Authorization: 'Bearer test' } });

            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body.id).toBe(fileId);
            expect(body.bucket_id).toBe(bucketId);
            expect(body.name).toBe('test-file.json');
            expect(body.created_at).toBeDefined();
            expect(body.updated_at).toBeDefined();
        });

        it('should return 404 for non-existent bucket file', async () => {
            const response = await fetch(`${getBaseURL()}/bucket-files/00000000-0000-0000-0000-000000000000`, { headers: { Authorization: 'Bearer test' } });

            expect(response.status).toBeGreaterThanOrEqual(400);
        });
    });

    describe('DELETE /bucket-files/:id', () => {
        it('should delete bucket file with 202 status', async () => {
            // Upload a second file to delete (keep original for other tests)
            const filePath = path.join(import.meta.dirname, '../../data/file.json');
            const fileContent = await fs.promises.readFile(filePath);
            const formData = new FormData();
            formData.append('file[0]', new Blob([fileContent]), 'to-delete.json');

            const uploadResponse = await fetch(`${getBaseURL()}/buckets/${bucketId}/upload`, {
                method: 'POST',
                headers: { Authorization: 'Bearer test' },
                body: formData,
            });
            const uploadBody = await uploadResponse.json();
            const deleteFileId = uploadBody.data[0].id;

            const response = await fetch(`${getBaseURL()}/bucket-files/${deleteFileId}`, {
                method: 'DELETE',
                headers: { Authorization: 'Bearer test' },
            });

            expect(response.status).toBe(202);

            const body = await response.json();
            expect(body.id).toBe(deleteFileId);
        });
    });

    it('should cleanup', async () => {
        const client = suite.client();
        await client.bucketFile.delete(fileId);
        await client.bucket.delete(bucketId);
    });
});
