/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { describe, expect, it } from 'vitest';
import FMasterImages from '../../../src/components/master-image/FMasterImages';
import { MASTER_IMAGE_SEARCH_FIELDS } from '../../../src/components/master-image/constants';
import { FSearch } from '../../../src/components/utility/search/FSearch';
import { mountClientVueComponent } from '../../utils';

// FSearch debounces input by 300 ms.
const waitForDebounce = () => new Promise((resolve) => {
    setTimeout(resolve, 350);
});

/**
 * The admin list searches master images with FSearch over
 * MASTER_IMAGE_SEARCH_FIELDS. A partial term must reach the server as a
 * `contains` on both fields; the list used to rewrite the search into an
 * equality on `virtualPath`, which matched only a complete path.
 */
describe('FMasterImages search', () => {
    it('should send a partial term as contains on name and virtualPath', async () => {
        const Harness = defineComponent({
            setup() {
                return () => h(FMasterImages, null, {
                    header: (props: Record<string, any>) => h(FSearch, {
                        fields: MASTER_IMAGE_SEARCH_FIELDS,
                        load: props.load,
                        meta: props.meta,
                    }),
                });
            },
        });

        const { wrapper, coreClient } = mountClientVueComponent(Harness, {}, { core: { 'GET /master-images': () => ({ data: [], meta: { total: 0 } }) } });

        await flushPromises();

        await wrapper.find('input').setValue('pyth');
        await waitForDebounce();
        await flushPromises();

        const url = decodeURIComponent(coreClient.requests.at(-1)!.url);

        expect(url).toContain("contains(name,'pyth')");
        expect(url).toContain("contains(virtualPath,'pyth')");
        expect(url).not.toContain("eq(virtualPath,'pyth')");
    });
});
