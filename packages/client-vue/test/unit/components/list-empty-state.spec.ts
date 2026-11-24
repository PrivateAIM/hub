/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { contains } from '@rapiq/core';
import { VCEmptyState } from '@vuecs/elements';
import { describe, expect, it } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import FAnalyses from '../../../src/components/analysis/FAnalyses';
import { mountClientVueComponent } from '../../utils';

describe('core/list empty state', () => {
    it('should title an empty list with its noMore content, and switch to noResults after a search', async () => {
        const { wrapper } = mountClientVueComponent(FAnalyses, {}, { core: { 'GET /analyses': () => ({ data: [], meta: { total: 0 } }) } });

        await flushPromises();

        const variant = () => wrapper.findComponent(VCEmptyState).props('variant');

        expect(wrapper.text()).toContain('No analyses yet');
        expect(variant()).toBe('empty');

        await wrapper.vm.load({ filters: contains('name', 'nothing-matches') });
        await flushPromises();

        expect(wrapper.text()).not.toContain('No analyses yet');
        expect(wrapper.text()).toContain('No results');
        expect(variant()).toBe('noResults');
        // `noResults` defaults a Reset action the list cannot honor.
        expect(wrapper.find('button').exists()).toBeFalsy();

        await wrapper.vm.load({ filters: {} });
        await flushPromises();

        expect(wrapper.text()).toContain('No analyses yet');
        expect(variant()).toBe('empty');
    });
});
