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
import { PermissionName } from '@privateaim/kit';
import { createAdminAccessToken, createRestrictedAccessToken } from '@privateaim/server-test-kit';
import { createTestSuite } from '../../utils/index.ts';
import { createTestBucket } from '../../utils/domains/index.ts';

/**
 * Identity (login) reads of storage: one of `bucket_read` / `bucket_update` /
 * `bucket_delete` reaching the bucket's realm, or ownership of the bucket.
 * Anything else lists nothing and answers 404 on a record.
 */
describe('identity read access to buckets and bucket files', () => {
    const suite = createTestSuite();

    let baseURL: string;
    let admin: string;

    let bucketId: string;
    let otherBucketId: string;
    let fileId: string;

    const request = (token: string, path: string, init: RequestInit = {}) => fetch(`${baseURL}${path}`, {
        ...init,
        headers: { ...init.headers, Authorization: `Bearer ${token}` },
    });

    const listIds = async (token: string, path: string): Promise<string[]> => {
        const response = await request(token, path);

        expect(response.status).toBe(200);

        const body = await response.json();

        return body.data.map((item: { id: string }) => item.id);
    };

    const upload = async (token: string, id: string, name: string) => {
        const formData = new FormData();

        formData.append('file[0]', new Blob([JSON.stringify({ name })]), name);

        return request(token, `/buckets/${id}/upload`, { method: 'POST', body: formData });
    };

    beforeAll(async () => {
        await suite.up();

        admin = await createAdminAccessToken();

        const client = suite.client();

        baseURL = client.getBaseURL().replace(/\/+$/, '');

        const { data: bucket } = await client.bucket.create(createTestBucket());
        const { data: otherBucket } = await client.bucket.create(createTestBucket());

        bucketId = bucket.id;
        otherBucketId = otherBucket.id;

        const uploaded = await upload(admin, bucketId, 'read-access.json');

        expect(uploaded.status).toBe(201);

        fileId = (await uploaded.json()).data[0].id;
    });

    afterAll(async () => {
        await suite.down();
    });

    describe('without any bucket permission', () => {
        let token: string;

        beforeAll(async () => {
            token = await createRestrictedAccessToken();
        });

        it('should list none of the buckets', async () => {
            expect(await listIds(token, '/buckets')).toEqual([]);
            expect(await listIds(token, `/buckets?filter[id]=${bucketId}`)).toEqual([]);
        });

        it('should not read a bucket', async () => {
            expect((await request(token, `/buckets/${bucketId}`)).status).toBe(404);
            expect((await request(token, `/buckets/${bucketId}?fields=name`)).status).toBe(404);
        });

        it('should not stream a bucket', async () => {
            expect((await request(token, `/buckets/${bucketId}/stream`)).status).toBe(404);
        });

        it('should not list files through a bucket filter', async () => {
            expect(await listIds(token, `/bucket-files?filter[bucketId]=${bucketId}`)).toEqual([]);
            expect(await listIds(token, '/bucket-files?include=bucket')).not.toContain(fileId);
        });

        it('should not read a file', async () => {
            expect((await request(token, `/bucket-files/${fileId}`)).status).toBe(404);
            expect((await request(token, `/bucket-files/${fileId}?include=bucket`)).status).toBe(404);
        });

        it('should not stream a file', async () => {
            expect((await request(token, `/bucket-files/${fileId}/stream`)).status).toBe(404);
        });
    });

    describe.each([
        PermissionName.BUCKET_READ,
        PermissionName.BUCKET_UPDATE,
        PermissionName.BUCKET_DELETE,
    ])('with %s', (permissionName) => {
        let token: string;

        beforeAll(async () => {
            token = await createRestrictedAccessToken([permissionName]);
        });

        it('should list and read the buckets', async () => {
            expect(await listIds(token, `/buckets?filter[id]=${bucketId}`)).toEqual([bucketId]);
            expect(await listIds(token, `/buckets?filter[id]=${otherBucketId}`)).toEqual([otherBucketId]);

            expect((await request(token, `/buckets/${bucketId}`)).status).toBe(200);
        });

        it('should list and read the files', async () => {
            expect(await listIds(token, `/bucket-files?filter[bucketId]=${bucketId}`)).toEqual([fileId]);

            const response = await request(token, `/bucket-files/${fileId}?include=bucket`);

            expect(response.status).toBe(200);

            const body = await response.json();

            expect(body.data.bucket.id).toBe(bucketId);
        });

        it('should read sparse fieldsets through the bucket join', async () => {
            expect(await listIds(token, `/bucket-files?fields=name&filter[bucketId]=${bucketId}`)).toHaveLength(1);

            const response = await request(token, `/bucket-files/${fileId}?fields=name`);

            expect(response.status).toBe(200);

            const body = await response.json();

            expect(body.data.name).toBe('read-access.json');
        });

        it('should stream a bucket and a file', async () => {
            const bucket = await request(token, `/buckets/${bucketId}/stream`);

            expect(bucket.status).toBe(200);
            await bucket.arrayBuffer();

            const file = await request(token, `/bucket-files/${fileId}/stream`);

            expect(file.status).toBe(200);
            await file.arrayBuffer();
        });
    });

    describe('as the owner without a read permission', () => {
        let token: string;
        let ownBucketId: string;
        let ownFileId: string;

        beforeAll(async () => {
            token = await createRestrictedAccessToken([PermissionName.BUCKET_CREATE]);

            const created = await request(token, '/buckets', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(createTestBucket()),
            });

            expect(created.status).toBe(201);

            ownBucketId = (await created.json()).data.id;

            // Uploaded by the admin, i.e. not by the owner: the bucket decides.
            const uploaded = await upload(admin, ownBucketId, 'owned.json');

            expect(uploaded.status).toBe(201);

            ownFileId = (await uploaded.json()).data[0].id;
        });

        it('should list exactly its own bucket', async () => {
            expect(await listIds(token, '/buckets')).toEqual([ownBucketId]);
        });

        it('should read and stream its own bucket only', async () => {
            expect((await request(token, `/buckets/${ownBucketId}`)).status).toBe(200);
            expect((await request(token, `/buckets/${bucketId}`)).status).toBe(404);

            const stream = await request(token, `/buckets/${ownBucketId}/stream`);

            expect(stream.status).toBe(200);
            await stream.arrayBuffer();
        });

        it('should list, read and stream the files of its own bucket only', async () => {
            expect(await listIds(token, '/bucket-files')).toEqual([ownFileId]);
            // The reach joins `bucket`: a sparse fieldset without `id` still pages.
            expect(await listIds(token, '/bucket-files?fields=name')).toHaveLength(1);
            expect((await request(token, `/bucket-files/${ownFileId}?fields=name`)).status).toBe(200);
            expect((await request(token, `/bucket-files/${ownFileId}`)).status).toBe(200);
            expect((await request(token, `/bucket-files/${fileId}`)).status).toBe(404);

            const stream = await request(token, `/bucket-files/${ownFileId}/stream`);

            expect(stream.status).toBe(200);
            await stream.arrayBuffer();
        });
    });

    describe('as the admin', () => {
        it('should list and read everything', async () => {
            expect(await listIds(admin, `/buckets?filter[id]=${bucketId}`)).toEqual([bucketId]);
            expect(await listIds(admin, `/buckets?filter[id]=${otherBucketId}`)).toEqual([otherBucketId]);

            expect((await request(admin, `/buckets/${bucketId}`)).status).toBe(200);
            expect((await request(admin, `/bucket-files/${fileId}`)).status).toBe(200);
        });
    });
});
