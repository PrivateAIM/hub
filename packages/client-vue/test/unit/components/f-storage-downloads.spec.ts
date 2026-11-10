/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { flushPromises } from '@vue/test-utils';
import type { AnalysisBucket } from '@privateaim/core-kit';
import type { BucketFile } from '@privateaim/storage-kit';
import { defineComponent, h } from 'vue';
import { 
    afterEach, 
    describe, 
    expect, 
    it, 
} from 'vitest';
import { FAnalysisBucketDownload } from '../../../src/components/analysis-bucket/FAnalysisBucketDownload';
import { FBucketFileDownload } from '../../../src/components/bucket-file/FBucketFileDownload';
import { provideAnalysisStorageScope } from '../../../src/core';
import { mountClientVueComponent } from '../../utils';

type Capture = {
    href: string, 
    download: string, 
    rel: string, 
    referrerPolicy: string 
};

const captured : Capture[] = [];

const listener = (event: Event) => {
    const { target } = event;

    if (!(target instanceof HTMLAnchorElement)) {
        return;
    }

    captured.push({
        href: target.href,
        download: target.getAttribute('download') ?? '',
        rel: target.rel,
        referrerPolicy: target.referrerPolicy,
    });
    event.preventDefault();
};

const coreHandlers = {
    'POST /analyses/:id/storage-tokens': () => ({
        token: 'a.b+c/d',
        expiresAt: new Date(Date.now() + 60 * 1000).toISOString(),
    }),
};

afterEach(() => {
    document.removeEventListener('click', listener, true);
    captured.length = 0;
});

describe('storage downloads', () => {
    it('FAnalysisBucketDownload mints one 60s token and clicks the stream anchor', async () => {
        document.addEventListener('click', listener, { capture: true });

        const entity = { analysisId: 'A1', bucketId: 'B1' } as AnalysisBucket;
        const { wrapper, coreClient } = mountClientVueComponent(
            FAnalysisBucketDownload,
            { entity },
            { core: coreHandlers },
        );

        await wrapper.trigger('click');
        await flushPromises();

        expect(coreClient.requests).toHaveLength(1);
        expect(coreClient.requests[0]).toMatchObject({
            params: { id: 'A1' },
            body: { cap: ['bucket:B1:read'], lifetime: 60 },
        });
        expect(captured).toHaveLength(1);
        expect(captured[0]?.href).toMatch(/\/buckets\/B1\/stream\?dt=a\.b%2Bc%2Fd$/);
        expect(captured[0]).toMatchObject({
            download: '',
            rel: 'noopener noreferrer',
            referrerPolicy: 'no-referrer',
        });
    });

    it('FBucketFileDownload mints a file capability inside a scope', async () => {
        document.addEventListener('click', listener, { capture: true });

        const entity = { id: 'F1', bucketId: 'B1' } as BucketFile;
        const Host = defineComponent({
            setup() {
                provideAnalysisStorageScope({ analysisId: 'A1' });

                return () => h(FBucketFileDownload, { entity });
            },
        });
        const { wrapper, coreClient } = mountClientVueComponent(Host, {}, { core: coreHandlers });

        await wrapper.find('button, a').trigger('click');
        await flushPromises();

        expect(coreClient.requests).toHaveLength(1);
        expect(coreClient.requests[0]).toMatchObject({
            params: { id: 'A1' },
            body: { cap: ['bucket-file:F1:read'], lifetime: 60 },
        });
        expect(captured).toHaveLength(1);
        expect(captured[0]?.href).toMatch(/\/bucket-files\/F1\/stream\?dt=a\.b%2Bc%2Fd$/);
    });

    it('FBucketFileDownload fails without a scope and mints nothing', async () => {
        document.addEventListener('click', listener, { capture: true });

        const entity = { id: 'F1', bucketId: 'B1' } as BucketFile;
        const { wrapper, coreClient } = mountClientVueComponent(
            FBucketFileDownload,
            { entity },
            { core: coreHandlers },
        );

        await wrapper.trigger('click');
        await flushPromises();

        expect(coreClient.requests).toHaveLength(0);
        expect(captured).toHaveLength(0);
        expect(wrapper.emitted('failed')?.[0]?.[0]).toBeInstanceOf(Error);
    });
});
