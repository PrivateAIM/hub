/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import FAnalyses from '../../../src/components/analysis/FAnalyses';
import { createTestAnalysis } from '../../utils/factories';
import { mountClientVueComponent } from '../../utils';

describe('core/list load coalescing', () => {
    it('should run a load requested while another is in flight, instead of dropping it', async () => {
        let release : () => void = () => {};
        const pending = new Promise<void>((resolve) => {
            release = resolve;
        });

        const entity = createTestAnalysis();

        let calls = 0;
        const listRef = ref<InstanceType<typeof FAnalyses> | null>(null);

        const host = defineComponent({
            setup() {
                return () => h(FAnalyses, { ref: listRef }, { item: (props: { data: { name: string } }) => h('div', props.data.name) });
            },
        });

        const { coreClient } = mountClientVueComponent(host, {}, {
            core: {
                'GET /analyses': () => {
                    calls++;
                    // first request hangs until released; later ones resolve
                    if (calls === 1) {
                        return pending.then(() => ({ data: [], meta: { total: 0 } }));
                    }
                    return { data: [entity], meta: { total: 1 } };
                },
            },
        });

        await flushPromises();
        expect(calls).toBe(1);

        // requested while the first load is still in flight — previously a
        // silent no-op, leaving the list on the stale result
        listRef.value!.load({ pagination: { offset: 0 } });
        await flushPromises();
        expect(calls).toBe(1);

        release();
        await flushPromises();

        expect(calls).toBe(2);
        expect(coreClient.requests).toHaveLength(2);
    });

    it('should drain the queued load even when the active request fails', async () => {
        let reject : (e: Error) => void = () => {};
        const failing = new Promise<never>((_resolve, rej) => {
            reject = rej;
        });

        const entity = createTestAnalysis();

        let calls = 0;
        const listRef = ref<InstanceType<typeof FAnalyses> | null>(null);

        const host = defineComponent({
            setup() {
                return () => h(FAnalyses, { ref: listRef }, { item: (props: { data: { name: string } }) => h('div', props.data.name) });
            },
        });

        mountClientVueComponent(host, {}, {
            core: {
                'GET /analyses': () => {
                    calls++;
                    if (calls === 1) {
                        return failing;
                    }
                    return { data: [entity], meta: { total: 1 } };
                },
            },
        });

        await flushPromises();
        expect(calls).toBe(1);

        listRef.value!.load({ pagination: { offset: 0 } });
        await flushPromises();

        // the in-flight request FAILS — the queued load must still run
        // instead of being stranded
        reject(new Error('boom'));
        await flushPromises();
        expect(calls).toBe(2);

        // and the stranded input must not replay on the next unrelated load
        listRef.value!.load({ pagination: { offset: 0 } });
        await flushPromises();
        expect(calls).toBe(3);
    });
});
