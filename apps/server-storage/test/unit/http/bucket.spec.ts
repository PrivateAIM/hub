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
import type { Readable } from 'node:stream';
import type { ComponentHandlerContext } from 'hubwire';
import type { BucketComponentEventMap } from '@privateaim/server-storage-kit';
import { BucketCommand, BucketEvent } from '@privateaim/server-storage-kit';
import { PermissionName } from '@privateaim/kit';
import { createAdminAuthorizationHeader, createRestrictedAccessToken } from '@privateaim/server-test-kit';
import {
    createTestSuite,
} from '../../utils/index.ts';
import { createTestBucket } from '../../utils/domains/index.ts';
import { toBucketName } from '../../../src/core/utils/bucket-name.ts';
import type { IStorageAdapter } from '../../../src/core/storage/types.ts';
import { BucketClearHandler } from '../../../src/app/components/bucket/handlers/clear/index.ts';
import { BucketCreateHandler } from '../../../src/app/components/bucket/handlers/create/index.ts';
import { RacingBucketCreateHandler } from './racing-bucket-create-handler.ts';

/**
 * Delegates to a real adapter, but fails one operation like an unreachable backend.
 */
class FailingStorageAdapter implements IStorageAdapter {
    protected inner: IStorageAdapter;

    protected failOn: 'bucketExists' | 'removeObjects';

    constructor(inner: IStorageAdapter, failOn: 'bucketExists' | 'removeObjects') {
        this.inner = inner;
        this.failOn = failOn;
    }

    async bucketExists(name: string) {
        if (this.failOn === 'bucketExists') {
            throw new Error('storage unavailable');
        }
        return this.inner.bucketExists(name);
    }

    makeBucket(name: string, region?: string) { return this.inner.makeBucket(name, region); }

    removeBucket(name: string) { return this.inner.removeBucket(name); }

    putObject(bucket: string, key: string, data: Buffer | Readable, size?: number) {
        return this.inner.putObject(bucket, key, data, size);
    }

    getObject(bucket: string, key: string) { return this.inner.getObject(bucket, key); }

    removeObject(bucket: string, key: string) { return this.inner.removeObject(bucket, key); }

    async removeObjects(bucket: string, keys: string[]): Promise<void> {
        if (this.failOn === 'removeObjects') {
            throw new Error('storage unavailable');
        }
        return this.inner.removeObjects(bucket, keys);
    }

    listObjects(bucket: string, prefix?: string) { return this.inner.listObjects(bucket, prefix); }
}

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
            expect(body.meta).toEqual({});
            expect(body.data.id).toBeDefined();
            expect(body.data.name).toBe(input.name);
            expect(body.data.region).toBe('eu-west');

            bucketId = body.data.id;
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
            expect(body.data.id).toBeDefined();
            expect(typeof body.data.id).toBe('string');
            expect(body.data.name).toBe(input.name);
            expect(body.data.region).toBe('us-east');
            expect(body.data.createdAt).toBeDefined();
            expect(body.data.updatedAt).toBeDefined();
        });

        it('should reject a refId on HTTP creates', async () => {
            const response = await fetch(`${getBaseURL()}/buckets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: authorization,
                },
                body: JSON.stringify(createTestBucket({ refType: 'analysis', refId: crypto.randomUUID() })),
            });

            expect(response.status).toBe(400);
        });

        it('should reuse the bucket of a repeated bus create with the same ref and name', async () => {
            const input = createTestBucket({ refType: 'analysis', refId: crypto.randomUUID() });
            const finished: string[] = [];
            const handler = new BucketCreateHandler({ storage: suite.storage() });
            const handle = () => handler.handle({ ...input }, {
                key: BucketCommand.CREATE,
                metadata: {},
                handle: async (...event) => {
                    if (event[0] === BucketEvent.CREATION_FINISHED) {
                        finished.push(event[1].id);
                    }
                },
            });

            await handle();
            await handle();

            expect(finished).toHaveLength(2);
            expect(finished[1]).toBe(finished[0]);
        });

        it('should resolve a create that lost the unique race to the existing bucket', async () => {
            const input = createTestBucket({
                refType: 'analysis',
                refId: crypto.randomUUID(),
                realmId: crypto.randomUUID(),
            });
            const finished: string[] = [];
            const handle = (handler: BucketCreateHandler) => handler.handle({ ...input }, {
                key: BucketCommand.CREATE,
                metadata: {},
                handle: async (...event) => {
                    if (event[0] === BucketEvent.CREATION_FINISHED) {
                        finished.push(event[1].id);
                    }
                },
            });

            await handle(new BucketCreateHandler({ storage: suite.storage() }));
            await handle(new RacingBucketCreateHandler({ storage: suite.storage() }));

            expect(finished).toHaveLength(2);
            expect(finished[1]).toBe(finished[0]);
        });

        it('should record the actor of a bus create from the command', async () => {
            const actorId = crypto.randomUUID();
            let created: Record<string, any> | undefined;
            const handler = new BucketCreateHandler({ storage: suite.storage() });
            await handler.handle({
                ...createTestBucket(),
                actorId,
                actorType: 'client',
            }, {
                key: BucketCommand.CREATE,
                metadata: {},
                handle: async (...event) => {
                    if (event[0] === BucketEvent.CREATION_FINISHED) {
                        created = event[1];
                    }
                },
            });

            expect(created).toMatchObject({ actorId, actorType: 'client' });
        });

        it('should not dedupe ref-less buckets by name', async () => {
            const input = createTestBucket();
            const create = () => fetch(`${getBaseURL()}/buckets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: authorization,
                },
                body: JSON.stringify(input),
            }).then((response) => response.json());

            const first = await create();
            const second = await create();
            expect(first.data.id).not.toBe(second.data.id);
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
            expect(body.data.id).toBe(bucketId);
            expect(body.data.name).toBeDefined();
            expect(body.data.region).toBe('eu-west');
            expect(body.meta.schema).toBeDefined();
            expect(body.meta.schema.name).toBe('bucket');
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
            streamBucketId = bucket.data.id;

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
            expect(body.data[0].bucketId).toBe(bucketId);
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
            expect(body.data.id).toBe(bucketId);
            expect(body.meta).toEqual({});
        });
    });

    describe('POST /buckets/:id/clear', () => {
        function createClearContext() {
            const emitted: string[] = [];
            const context: ComponentHandlerContext<BucketComponentEventMap, BucketCommand.CLEAR> = {
                key: BucketCommand.CLEAR,
                metadata: {},
                handle: async (key) => { emitted.push(key); },
            };
            return { context, emitted };
        }

        it('should rethrow an unreachable backend (bus retry) before removing anything', async () => {
            const handler = new BucketClearHandler({ storage: new FailingStorageAdapter(suite.storage(), 'bucketExists') });
            const { context, emitted } = createClearContext();
            const before = await suite.client().bucketFile.getMany({ filters: { bucketId } });
            expect(before.data.length).toBeGreaterThanOrEqual(1);

            await expect(handler.handle({ id: bucketId }, context)).rejects.toThrow('storage unavailable');
            expect(emitted).toContain(BucketEvent.CLEARING_FAILED);

            const after = await suite.client().bucketFile.getMany({ filters: { bucketId } });
            expect(after.meta.total).toBe(before.meta.total);
            const keys = before.data.map((file) => file.hash);
            expect(await suite.storage().listObjects(toBucketName(bucketId))).toEqual(expect.arrayContaining(keys));
        });

        it('should not rethrow for a missing bucket (no retry)', async () => {
            const handler = new BucketClearHandler({ storage: suite.storage() });
            const { context, emitted } = createClearContext();

            await expect(handler.handle({ id: '00000000-0000-0000-0000-000000000000' }, context)).resolves.toBeUndefined();
            expect(emitted).toContain(BucketEvent.CLEARING_FAILED);
        });

        it('should remove all files and stored objects but keep the bucket', async () => {
            const client = suite.client();
            const bucketName = toBucketName(bucketId);

            const before = await client.bucketFile.getMany({ filters: { bucketId } });
            expect(before.data.length).toBeGreaterThanOrEqual(1);
            const keys = before.data.map((file) => file.hash);
            expect(await suite.storage().listObjects(bucketName)).toEqual(expect.arrayContaining(keys));

            const response = await client.bucket.clear(bucketId);
            expect(response.data.id).toBe(bucketId);
            expect(response.data).not.toHaveProperty('fileIds');
            expect(response.meta).toEqual({});

            const bucket = await client.bucket.getOne(bucketId);
            expect(bucket.data.id).toBe(bucketId);

            const after = await client.bucketFile.getMany({ filters: { bucketId } });
            expect(after.data).toEqual([]);
            expect(after.meta.total).toBe(0);

            const remaining = await suite.storage().listObjects(bucketName);
            expect(remaining.filter((key) => keys.includes(key))).toEqual([]);
        });

        it('should still clear the rows when object removal fails (no broken files)', async () => {
            const filePath = path.join(import.meta.dirname, '../../data/file.json');
            const formData = new FormData();
            formData.append('file[0]', new Blob([await fs.promises.readFile(filePath)]), 'clear-leftover.json');
            await fetch(`${getBaseURL()}/buckets/${bucketId}/upload`, {
                method: 'POST',
                headers: { Authorization: authorization },
                body: formData,
            });

            const before = await suite.client().bucketFile.getMany({ filters: { bucketId } });
            expect(before.data.length).toBe(1);

            const handler = new BucketClearHandler({ storage: new FailingStorageAdapter(suite.storage(), 'removeObjects') });
            const { context, emitted } = createClearContext();

            await expect(handler.handle({ id: bucketId }, context)).resolves.toBeUndefined();
            expect(emitted).toContain(BucketEvent.CLEARING_FINISHED);
            expect(emitted).not.toContain(BucketEvent.CLEARING_FAILED);

            const after = await suite.client().bucketFile.getMany({ filters: { bucketId } });
            expect(after.meta.total).toBe(0);

            // the object is a harmless leftover, removed with the bucket.
            expect(await suite.storage().listObjects(toBucketName(bucketId))).toContain(before.data[0].hash);
        });

        it('should return 404 for non-existent bucket', async () => {
            const response = await fetch(`${getBaseURL()}/buckets/00000000-0000-0000-0000-000000000000/clear`, {
                method: 'POST',
                headers: { Authorization: authorization },
            });

            expect(response.status).toBe(404);
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
            expect(body.data.id).toBe(bucketId);
            expect(body.meta).toEqual({});
        });

        it('should return 404 for non-existent bucket', async () => {
            const response = await fetch(`${getBaseURL()}/buckets/00000000-0000-0000-0000-000000000000`, {
                method: 'DELETE',
                headers: { Authorization: authorization },
            });

            expect(response.status).toBeGreaterThanOrEqual(400);
        });
    });

    describe('ownership', () => {
        const request = (token: string, method: string, url: string, body?: Record<string, any>) => fetch(`${getBaseURL()}${url}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        it('should let the creator, and only the creator, delete a bucket without BUCKET_DELETE', async () => {
            const creator = await createRestrictedAccessToken([PermissionName.BUCKET_CREATE]);
            const other = await createRestrictedAccessToken([PermissionName.BUCKET_CREATE]);
            const spoofed = crypto.randomUUID();

            // the actor comes from the token, never from the body
            const created = await request(creator, 'POST', '/buckets', {
                ...createTestBucket(),
                actorId: spoofed,
                actorType: 'client',
            });
            expect(created.status).toBe(201);
            const { data: bucket } = await created.json();
            expect(bucket.actorType).toBe('user');
            expect(bucket.actorId).toBeTruthy();
            expect(bucket.actorId).not.toBe(spoofed);

            expect((await request(other, 'DELETE', `/buckets/${bucket.id}`)).status).toBe(403);
            expect((await request(creator, 'DELETE', `/buckets/${bucket.id}`)).status).toBe(202);
        });

        describe('upload', () => {
            const upload = async (token: string, id: string) => {
                const formData = new FormData();
                formData.append('file[0]', new Blob([await fs.promises.readFile(path.join(import.meta.dirname, '../../data/file.json'))]), `${crypto.randomUUID()}.json`);

                return fetch(`${getBaseURL()}/buckets/${id}/upload`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
            };

            const countFiles = async (id: string) => {
                const { meta } = await suite.client().bucketFile.getMany({ filters: { bucketId: id } });
                return meta.total;
            };

            let refLessBucketId: string;

            beforeAll(async () => {
                const creator = await createRestrictedAccessToken([PermissionName.BUCKET_CREATE]);
                const created = await request(creator, 'POST', '/buckets', createTestBucket());
                expect(created.status).toBe(201);
                refLessBucketId = (await created.json()).data.id;

                expect((await upload(creator, refLessBucketId)).status).toBe(201);
            });

            it('should deny a non-owner without BUCKET_UPDATE before storing anything', async () => {
                const before = await countFiles(refLessBucketId);
                const other = await createRestrictedAccessToken([PermissionName.BUCKET_CREATE]);

                expect((await upload(other, refLessBucketId)).status).toBe(403);
                expect(await countFiles(refLessBucketId)).toBe(before);
            });

            it('should let a BUCKET_UPDATE holder of the bucket realm upload', async () => {
                const updater = await createRestrictedAccessToken([PermissionName.BUCKET_UPDATE]);

                expect((await upload(updater, refLessBucketId)).status).toBe(201);
            });

            it('should leave uploads to a bucket with a ref to the owning service', async () => {
                let bucketId: string | undefined;
                const handler = new BucketCreateHandler({ storage: suite.storage() });
                await handler.handle(createTestBucket({ refType: 'analysis', refId: crypto.randomUUID() }), {
                    key: BucketCommand.CREATE,
                    metadata: {},
                    handle: async (...event) => {
                        if (event[0] === BucketEvent.CREATION_FINISHED) {
                            bucketId = event[1].id;
                        }
                    },
                });
                expect(bucketId).toBeDefined();

                const stranger = await createRestrictedAccessToken();
                expect((await upload(stranger, bucketId!)).status).toBe(201);
            });
        });
    });
});
