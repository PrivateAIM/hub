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
import { Readable } from 'node:stream';
import { streamToBuffer } from '../../../src/core/index.ts';
import {
    createTestSuite,
} from '../../utils/index.ts';
import { createTestBucket } from '../../utils/domains/index.ts';

describe('bucket-file stream endpoint', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    let bucketId: string;
    let fileId: string;

    it('should create bucket and upload file', async () => {
        const client = suite.client();

        const bucket = await client.bucket.create(createTestBucket());
        bucketId = bucket.id;

        const content = Buffer.from(JSON.stringify({ hello: 'world' }));
        const formData = new FormData();
        formData.append('file[0]', new Blob([content]), 'test-data.json');

        const result = await client.bucket.upload(bucketId, formData);
        expect(result.data.length).toBe(1);
        fileId = result.data[0].id;
    });

    it('should stream file with Content-Disposition attachment header', async () => {
        const client = suite.client();
        const baseURL = client.getBaseURL().replace(/\/+$/, '');

        const response = await fetch(`${baseURL}/bucket-files/${fileId}/stream`, { headers: { Authorization: 'Bearer test' } });

        expect(response.status).toBe(200);

        const contentDisposition = response.headers.get('content-disposition');
        expect(contentDisposition).toBeDefined();
        expect(contentDisposition).toContain('attachment');
        expect(contentDisposition).toContain('test-data.json');

        const contentType = response.headers.get('content-type');
        expect(contentType).toBeDefined();
        expect(contentType).toContain('application/json');

        const body = await response.arrayBuffer();
        expect(body.byteLength).toBeGreaterThan(0);

        const text = new TextDecoder().decode(body);
        expect(JSON.parse(text)).toEqual({ hello: 'world' });
    });

    it('should stream file with gzip encoding when accepted', async () => {
        const client = suite.client();
        const baseURL = client.getBaseURL().replace(/\/+$/, '');

        const response = await fetch(`${baseURL}/bucket-files/${fileId}/stream`, {
            headers: {
                Authorization: 'Bearer test',
                'Accept-Encoding': 'gzip, deflate',
            },
        });

        expect(response.status).toBe(200);

        const contentEncoding = response.headers.get('content-encoding');
        expect(contentEncoding).toBe('gzip');

        const contentDisposition = response.headers.get('content-disposition');
        expect(contentDisposition).toContain('attachment');

        const body = await response.arrayBuffer();
        expect(body.byteLength).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent file stream', async () => {
        const client = suite.client();
        const baseURL = client.getBaseURL().replace(/\/+$/, '');

        const response = await fetch(`${baseURL}/bucket-files/00000000-0000-0000-0000-000000000000/stream`, { headers: { Authorization: 'Bearer test' } });

        expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should stream file via API client', async () => {
        const client = suite.client();
        const data = await client.bucketFile.stream(fileId);
        const stream = Readable.fromWeb(data as any);
        const buffer = await streamToBuffer(stream);
        expect(buffer.byteLength).toBeGreaterThan(0);
    });

    it('should delete file and bucket', async () => {
        const client = suite.client();
        await client.bucketFile.delete(fileId);
        await client.bucket.delete(bucketId);
    });
});
