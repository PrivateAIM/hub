/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { fakeResponse } from '@privateaim/core-http-kit/testing';
import { flushPromises } from '@vue/test-utils';
import { Suspense, defineComponent, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { FAnalysisBucketDownload } from '../../../src/components/analysis-bucket/FAnalysisBucketDownload';
import FAnalysisNodeInCard from '../../../src/components/analysis-node/FAnalysisNodeInCard.vue';
import { createTestAnalysisNode } from '../../utils/factories';
import { mountClientVueComponent } from '../../utils';

describe('components/FAnalysisNodeInCard', () => {
    it('emits failed when the code download mint is rejected', async () => {
        const entity = createTestAnalysisNode();
        const failures : unknown[] = [];

        // FAnalysisBucket resolves in an async setup, which needs a Suspense
        // boundary the harness does not provide.
        const Host = defineComponent(() => () => h(Suspense, null, {
            default: () => h(FAnalysisNodeInCard, {
                entity,
                onFailed: (e: unknown) => {
                    failures.push(e);
                },
            }),
        }));

        const { wrapper } = mountClientVueComponent(
            Host,
            {},
            {
                core: {
                    'GET /analysis-buckets': () => ({
                        data: [{
                            id: 'AB1',
                            analysisId: entity.analysisId,
                            bucketId: 'B1',
                        }],
                        meta: { total: 1 },
                    }),
                    'POST /analyses/:id/storage-tokens': () => fakeResponse(403, { message: 'denied' }),
                },
            },
        );

        await flushPromises();

        await wrapper.findComponent(FAnalysisBucketDownload).trigger('click');
        await flushPromises();

        expect(failures[0]).toBeInstanceOf(Error);
    });
});
