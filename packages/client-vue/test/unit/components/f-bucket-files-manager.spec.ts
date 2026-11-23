/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { flushPromises } from '@vue/test-utils';
import { fakeResponse } from '@privateaim/core-http-kit/testing';
import { describe, expect, it } from 'vitest';
import { FBucketFileDownload } from '../../../src/components/bucket-file/FBucketFileDownload';
import FBucketFiles from '../../../src/components/bucket-file/FBucketFiles.vue';
import FBucketFilesManager from '../../../src/components/bucket-file/FBucketFilesManager.vue';
import FBucketFilesUpload from '../../../src/components/bucket-file/FBucketFilesUpload.vue';
import { mountClientVueComponent } from '../../utils';

const ANALYSIS_ID = 'A1';
const BUCKET_ID = 'B1';

function isMintBody(input: unknown): input is { cap: string[] } {
    return typeof input === 'object' && input !== null && 'cap' in input && Array.isArray(input.cap);
}

type UploadVM = { tempFiles: { file: File, path: string }[], upload(): Promise<void> };

function mountManager() {
    return mountClientVueComponent(
        FBucketFilesManager,
        { entityId: BUCKET_ID, analysisId: ANALYSIS_ID },
        {
            core: {
                'POST /analyses/:id/storage/token': (req) => {
                    const cap = isMintBody(req.body) ? req.body.cap[0] : '';

                    return {
                        token: `tok(${cap})`,
                        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
                    };
                },
            },
            storage: { 'POST /buckets/:id/upload': () => ({ data: [], meta: { total: 0 } }) },
        },
    );
}

describe('FBucketFilesManager', () => {
    it('lists files with a bucket read capability token', async () => {
        const { storageClient, coreClient } = mountManager();

        await flushPromises();

        const list = storageClient.requests.find((r) => r.method === 'GET' && r.url.includes('bucket-files'));

        expect(list).toBeDefined();
        expect(list?.headers.authorization).toBe(`Bearer tok(bucket:${BUCKET_ID}:read)`);

        const mints = coreClient.requests.filter((r) => r.method === 'POST');

        expect(mints).toHaveLength(1);
        expect(mints[0]).toMatchObject({
            params: { id: ANALYSIS_ID },
            body: { cap: [`bucket:${BUCKET_ID}:read`] },
        });
        expect(mints[0]?.body).not.toHaveProperty('lifetime');
    });

    it('uploads with a bucket write capability token', async () => {
        const { wrapper, storageClient } = mountManager();

        await flushPromises();

        wrapper.vm.add();
        await flushPromises();

        const upload = wrapper.findComponent<UploadVM>(FBucketFilesUpload);

        expect(upload.exists()).toBe(true);

        upload.vm.tempFiles = [{ file: new File(['x'], 'a.txt'), path: 'a.txt' }];
        await upload.vm.upload();
        await flushPromises();

        const request = storageClient.requests.find((r) => r.method === 'POST');

        expect(request).toBeDefined();
        expect(request?.headers.authorization).toBe(`Bearer tok(bucket:${BUCKET_ID}:write)`);
    });

    it('emits failed when a file download mint is rejected', async () => {
        const { wrapper } = mountClientVueComponent(
            FBucketFilesManager,
            { entityId: BUCKET_ID, analysisId: ANALYSIS_ID },
            {
                core: {
                    'POST /analyses/:id/storage/token': (req) => {
                        const cap = isMintBody(req.body) ? req.body.cap[0] : '';

                        if (cap?.startsWith('bucketFile:')) {
                            return fakeResponse(403, { message: 'denied' });
                        }

                        return {
                            token: `tok(${cap})`,
                            expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
                        };
                    },
                },
                storage: {
                    'GET /bucket-files': () => ({
                        data: [{
                            id: 'F1',
                            path: 'a.txt',
                            size: 1,
                            bucketId: BUCKET_ID,
                        }],
                        meta: { total: 1 },
                    }),
                },
            },
        );

        await flushPromises();

        await wrapper.findComponent(FBucketFileDownload).trigger('click');
        await flushPromises();

        expect(wrapper.emitted('failed')?.[0]?.[0]).toBeInstanceOf(Error);
    });

    it('mints again after a request is refused with 401', async () => {
        let deletes = 0;
        const { wrapper, coreClient } = mountClientVueComponent(
            FBucketFilesManager,
            { entityId: BUCKET_ID, analysisId: ANALYSIS_ID },
            {
                core: {
                    'POST /analyses/:id/storage/token': (req) => {
                        const cap = isMintBody(req.body) ? req.body.cap[0] : '';

                        return {
                            token: `tok(${cap})`,
                            expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
                        };
                    },
                },
                storage: {
                    'GET /bucket-files': () => ({ data: [], meta: { total: 0 } }),
                    'DELETE /bucket-files/:id': () => {
                        deletes += 1;

                        return deletes === 1 ?
                            fakeResponse(401, { message: 'expired' }) :
                            { data: { id: 'F1' }, meta: {} };
                    },
                },
            },
        );

        await flushPromises();

        const files = wrapper.findComponent<{ delete(id: string): Promise<void> }>(FBucketFiles);
        const deleteMints = () => coreClient.requests
            .filter((r) => r.method === 'POST' && isMintBody(r.body) && r.body.cap[0] === `bucket:${BUCKET_ID}:delete`);

        await files.vm.delete('F1');
        await flushPromises();

        expect(deleteMints()).toHaveLength(1);

        await files.vm.delete('F1');
        await flushPromises();

        expect(deletes).toBe(2);
        expect(deleteMints()).toHaveLength(2);
    });
});
