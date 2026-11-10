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
import {
    createAdminAccessToken,
    createCapabilityToken,
    createRestrictedAccessToken,
} from '@privateaim/server-test-kit';
import { createTestSuite } from '../../utils/index.ts';
import { createTestBucket } from '../../utils/domains/index.ts';

function decodeTokenPayload(token: string): Record<string, any> {
    const [, payload] = token.split('.');

    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
}

describe('capability tokens on bucket and bucket-file routes', () => {
    const suite = createTestSuite();

    let admin: string;
    let baseURL: string;

    let bucketId: string;
    let otherBucketId: string;
    let fileId: string;
    let otherFileId: string;

    const content = JSON.stringify({ hello: 'capability' });

    const request = (path: string, init: RequestInit = {}) => fetch(`${baseURL}${path}`, init);

    const bearer = (token: string): RequestInit => ({ headers: { Authorization: `Bearer ${token}` } });

    const mint = (cap: string[], expiresIn?: number, subjectToken?: string) => createCapabilityToken({
        subjectToken: subjectToken ?? admin,
        cap,
        expiresIn,
    });

    beforeAll(async () => {
        await suite.up();

        admin = await createAdminAccessToken();

        const client = suite.client();

        baseURL = client.getBaseURL().replace(/\/+$/, '');

        const { data: bucket } = await client.bucket.create(createTestBucket());
        const { data: otherBucket } = await client.bucket.create(createTestBucket());

        bucketId = bucket.id;
        otherBucketId = otherBucket.id;

        const formData = new FormData();

        formData.append('file[0]', new Blob([content]), 'capability.json');

        const { data: files } = await client.bucket.upload(bucketId, formData);

        fileId = files[0].id;

        const otherFormData = new FormData();

        otherFormData.append('file[0]', new Blob([content]), 'other.json');

        const { data: otherFiles } = await client.bucket.upload(otherBucketId, otherFormData);

        otherFileId = otherFiles[0].id;
    });

    afterAll(async () => {
        await suite.down();
    });

    describe('header token', () => {
        it('should read a covered bucket', async () => {
            const token = await mint([`bucket:${bucketId}:read`]);
            const response = await request(`/buckets/${bucketId}`, bearer(token));

            expect(response.status).toBe(200);

            const body = await response.json();

            expect(body.data.id).toBe(bucketId);
        });

        it('should refuse a bucket the capability does not cover', async () => {
            const token = await mint([`bucket:${otherBucketId}:read`]);
            const response = await request(`/buckets/${bucketId}`, bearer(token));

            expect(response.status).toBe(403);
        });

        it('should refuse a bucket covered only for another action', async () => {
            const token = await mint([`bucket:${bucketId}:write`]);
            const response = await request(`/buckets/${bucketId}`, bearer(token));

            expect(response.status).toBe(403);
        });

        it('should list only the covered buckets', async () => {
            const token = await mint([`bucket:${bucketId}:read`]);
            const response = await request('/buckets', bearer(token));

            expect(response.status).toBe(200);

            const body = await response.json();

            expect(body.data.map((item: { id: string }) => item.id)).toEqual([bucketId]);
        });

        it('should list no bucket for a capability naming only a file', async () => {
            const token = await mint([`bucket-file:${fileId}:read`]);
            const response = await request('/buckets', bearer(token));

            expect(response.status).toBe(200);

            const body = await response.json();

            expect(body.data).toEqual([]);
        });

        it('should not list files of another bucket through a filter', async () => {
            const token = await mint([`bucket:${bucketId}:read`]);
            const response = await request(`/bucket-files?filter[bucketId]=${otherBucketId}`, bearer(token));

            expect(response.status).toBe(200);

            const body = await response.json();

            expect(body.data).toEqual([]);
        });

        it('should list only a covered file', async () => {
            const token = await mint([`bucket-file:${otherFileId}:read`]);
            const response = await request('/bucket-files', bearer(token));

            expect(response.status).toBe(200);

            const body = await response.json();

            expect(body.data.map((item: { id: string }) => item.id)).toEqual([otherFileId]);
        });

        it('should read a file of a covered bucket', async () => {
            const token = await mint([`bucket:${bucketId}:read`]);
            const response = await request(`/bucket-files/${fileId}`, bearer(token));

            expect(response.status).toBe(200);
        });

        it('should refuse a file the capability does not cover', async () => {
            const token = await mint([`bucket:${bucketId}:read`]);
            const response = await request(`/bucket-files/${otherFileId}`, bearer(token));

            expect(response.status).toBe(403);
        });

        it('should refuse an upload with only read', async () => {
            const token = await mint([`bucket:${bucketId}:read`]);

            const formData = new FormData();

            formData.append('file[0]', new Blob([content]), 'denied.json');

            const response = await request(`/buckets/${bucketId}/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            expect(response.status).toBe(403);
        });

        it('should upload with write and record the token subject as uploader', async () => {
            // A subject without any storage permission: only the capability lets it upload.
            const subjectToken = await createRestrictedAccessToken();
            const token = await mint([`bucket:${bucketId}:write`], undefined, subjectToken);
            const payload = decodeTokenPayload(token);

            const formData = new FormData();

            formData.append('file[0]', new Blob([content]), 'uploaded.json');

            const response = await request(`/buckets/${bucketId}/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            expect(response.status).toBe(201);

            const body = await response.json();

            expect(body.data).toHaveLength(1);

            const { data: file } = await suite.client().bucketFile.getOne(body.data[0].id);

            expect(file.actorId).toBe(payload.sub);
            expect(file.actorType).toBe(payload.sub_kind);
            expect(file.realmId).toBe(payload.realm_id);
        });

        it('should refuse the login-only bucket routes', async () => {
            const token = await mint([`bucket:${bucketId}:read,write,delete`]);

            const clear = await request(`/buckets/${bucketId}/clear`, { method: 'POST', ...bearer(token) });

            expect(clear.status).toBe(401);

            const drop = await request(`/buckets/${bucketId}`, { method: 'DELETE', ...bearer(token) });

            expect(drop.status).toBe(401);

            const update = await request(`/buckets/${bucketId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
                body: JSON.stringify({ name: 'renamed' }),
            });

            expect(update.status).toBe(401);

            const create = await request('/buckets', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
                body: JSON.stringify(createTestBucket()),
            });

            expect(create.status).toBe(401);
        });
    });

    describe('query token', () => {
        it('should stream a covered file without any header', async () => {
            const token = await mint([`bucket-file:${fileId}:read`], 60);
            const response = await request(`/bucket-files/${fileId}/stream?dt=${token}`);

            expect(response.status).toBe(200);
            expect(response.headers.get('referrer-policy')).toBe('no-referrer');

            const contentDisposition = response.headers.get('content-disposition');

            expect(contentDisposition).toContain('attachment');
            expect(contentDisposition).toContain('capability.json');

            expect(await response.text()).toBe(content);
        });

        it('should refuse to stream a file the capability does not cover', async () => {
            const token = await mint([`bucket-file:${fileId}:read`], 60);
            const response = await request(`/bucket-files/${otherFileId}/stream?dt=${token}`);

            expect(response.status).toBe(403);
        });

        it('should refuse a long-lived token in the query', async () => {
            const token = await mint([`bucket-file:${fileId}:read`], 3600);
            const response = await request(`/bucket-files/${fileId}/stream?dt=${token}`);

            expect(response.status).toBe(401);
        });

        it('should refuse a query token on a non-stream route', async () => {
            const token = await mint([`bucket:${bucketId}:read`], 60);

            const bucket = await request(`/buckets/${bucketId}?dt=${token}`);

            expect(bucket.status).toBe(401);

            const files = await request(`/bucket-files?dt=${token}`);

            expect(files.status).toBe(401);
        });

        it('should stream a covered bucket as a tar', async () => {
            const token = await mint([`bucket:${bucketId}:read`], 60);
            const response = await request(`/buckets/${bucketId}/stream?dt=${token}`);

            expect(response.status).toBe(200);
            expect(response.headers.get('content-type')).toContain('application/x-tar');
            expect(response.headers.get('referrer-policy')).toBe('no-referrer');

            const body = await response.arrayBuffer();

            expect(body.byteLength).toBeGreaterThan(0);
        });

        it('should refuse to stream a bucket the capability does not cover', async () => {
            const token = await mint([`bucket:${otherBucketId}:read`], 60);
            const response = await request(`/buckets/${bucketId}/stream?dt=${token}`);

            expect(response.status).toBe(403);
        });
    });

    it('should set the referrer policy on an identity stream too', async () => {
        const response = await request(`/bucket-files/${fileId}/stream`, bearer(admin));

        expect(response.status).toBe(200);
        expect(response.headers.get('referrer-policy')).toBe('no-referrer');

        await response.arrayBuffer();
    });

    it('should refuse to delete a file with only read', async () => {
        const token = await mint([`bucket:${bucketId}:read`]);
        const response = await request(`/bucket-files/${fileId}`, { method: 'DELETE', ...bearer(token) });

        expect(response.status).toBe(403);
    });

    it('should delete a file of a bucket covered for delete', async () => {
        const token = await mint([`bucket:${bucketId}:delete`]);
        const response = await request(`/bucket-files/${fileId}`, { method: 'DELETE', ...bearer(token) });

        expect(response.status).toBe(202);
    });
});
