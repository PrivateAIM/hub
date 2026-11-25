/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { flushPromises } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import FMasterImages from '../../../src/components/master-image/FMasterImages';
import { mountClientVueComponent } from '../../utils';

/**
 * A page that remembers its search and re-sends that filters object on every
 * reload (the master-image admin page does, when a status tile changes) must
 * get the CURRENT page filter each time. The list used to merge the caller's
 * input as smob's first argument, which wrote the page filter into the
 * caller's object, so every later load carried the first status chosen.
 */
describe('core/list input isolation', () => {
    it('should not write the page filter into the caller\'s filters object', async () => {
        const { wrapper, coreClient } = mountClientVueComponent(
            FMasterImages,
            { query: { filters: { buildStatus: 'failed' } } },
            { core: { 'GET /master-images': () => ({ data: [], meta: { total: 0 } }) } },
        );

        await flushPromises();

        const search = {};

        await wrapper.vm.load({ filters: search });
        await flushPromises();

        expect(search).toEqual({});

        await wrapper.setProps({ query: { filters: { buildStatus: 'executed' } } });
        await wrapper.vm.load({ filters: search });
        await flushPromises();

        const url = decodeURIComponent(coreClient.requests.at(-1)!.url);

        expect(url).toContain("eq(buildStatus,'executed')");
        expect(url).not.toContain('failed');
        expect(search).toEqual({});
    });
});
