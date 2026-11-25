/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { flushPromises } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import FMasterImageStatusSummary from '../../../src/components/master-image/FMasterImageStatusSummary.vue';
import { mountClientVueComponent } from '../../utils';

const TOTALS: Record<string, number> = {
    all: 14,
    built: 8,
    building: 1,
    failed: 2,
};

/** Which tile a request counts for, read from its encoded filter. */
function resolveBucket(url: string) : string {
    const decoded = decodeURIComponent(url);

    if (decoded.includes('failed')) {
        return 'failed';
    }

    if (decoded.includes('executed')) {
        return 'built';
    }

    if (decoded.includes('starting') && decoded.includes('started')) {
        return 'building';
    }

    return 'all';
}

describe('FMasterImageStatusSummary', () => {
    it('should count each status bucket through meta.total', async () => {
        const { wrapper, coreClient } = mountClientVueComponent(
            FMasterImageStatusSummary,
            {},
            {
                core: {
                    'GET /master-images': (request) => ({
                        data: [],
                        meta: { total: TOTALS[resolveBucket(request.url)] },
                    }),
                },
            },
        );

        await flushPromises();

        expect(coreClient.requests).toHaveLength(4);

        for (const [status, total] of Object.entries(TOTALS)) {
            expect(wrapper.find(`[data-status="${status}"]`).text()).toContain(String(total));
        }
    });

    it('should emit the selected status bucket', async () => {
        const { wrapper } = mountClientVueComponent(
            FMasterImageStatusSummary,
            {},
            { core: { 'GET /master-images': () => ({ data: [], meta: { total: 0 } }) } },
        );

        await flushPromises();
        await wrapper.find('[data-status="failed"]').trigger('click');

        expect(wrapper.emitted('update:modelValue')).toEqual([['failed']]);
    });
});
