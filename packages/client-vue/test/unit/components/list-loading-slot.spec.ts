/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import FAnalyses from '../../../src/components/analysis/FAnalyses';
import { createTestAnalysis } from '../../utils/factories';
import { mountClientVueComponent } from '../../utils';

describe('core/list loading slot', () => {
    it('should render the loading slot during the first load and drop it once data arrives', async () => {
        let release : () => void = () => {};
        const pending = new Promise<void>((resolve) => {
            release = resolve;
        });

        const entity = createTestAnalysis();

        // The default item renderer (FAnalysisItem -> FAnalysis) has an async
        // setup and needs a <Suspense> boundary the harness does not provide —
        // the #item slot keeps this spec about the LIST behavior.
        const host = defineComponent({
            setup() {
                return () => h(FAnalyses, null, {
                    loading: () => h('div', { class: 'test-skeleton' }, 'skeleton-marker'),
                    item: (props: { data: { name: string } }) => h('div', { class: 'test-item' }, props.data.name),
                });
            },
        });

        const { wrapper } = mountClientVueComponent(host, {}, { core: { 'GET /analyses': () => pending.then(() => ({ data: [entity], meta: { total: 1 } })) } });

        await flushPromises();

        // request in flight, no data yet -> the skeleton stands in for the body
        expect(wrapper.find('.test-skeleton').exists()).toBeTruthy();

        release();
        await flushPromises();

        expect(wrapper.find('.test-skeleton').exists()).toBeFalsy();
        expect(wrapper.text()).toContain(entity.name);
    });
});
