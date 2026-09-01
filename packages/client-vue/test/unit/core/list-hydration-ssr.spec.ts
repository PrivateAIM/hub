// @vitest-environment node

/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { isServerRuntime } from '@authup/client-web-kit';
import { fakeResponse } from '@privateaim/core-http-kit/testing';
import type { Analysis } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import { defineComponent, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import FAnalyses from '../../../src/components/analysis/FAnalyses';
import type { ListHydrationSnapshot } from '../../../src/core';
import { createList } from '../../../src/core';
import { createTestAnalysis } from '../../utils/factories';
import { createClientVueApp } from '../../utils';

// The node environment leaves `window` undefined, which is exactly what
// `isServerRuntime()` reads — so every render below takes `createListRaw`'s
// server branch. The client half is in `list-hydration.spec.ts` (happy-dom).

// The key the list derives from `useId()` for this tree. See the same constant
// in the client spec: both sides must land on it, and that agreement is the
// entire handoff.
const HYDRATION_KEY = 'flame:list:analysis:v-0';

// There are no VTU stubs here, so the tree has to stay icon-free — hence the
// #item slot rather than the default FAnalysisItem renderer.
const host = defineComponent({
    setup() {
        return () => h(FAnalyses, null, { item: (props: { data: { name: string } }) => h('div', props.data.name) });
    },
});

describe('core/list hydration (server)', () => {
    it('should record the completed load and render its rows', async () => {
        // Pinned explicitly: if the `@vitest-environment` docblock above ever
        // stops being honoured, every assertion below still runs — against the
        // CLIENT branch, which never records anything.
        expect(isServerRuntime()).toBe(true);

        const entity = createTestAnalysis();
        // `Map` already satisfies authup's `HydrationStore` port (get/set/delete).
        const store = new Map<string, any>();

        const { app, coreClient } = createClientVueApp(host, {}, { core: { 'GET /analyses': () => ({ data: [entity], meta: { total: 1 } }) } }, { hydrationStore: store });

        const html = await renderToString(app);

        expect(coreClient.requests).toHaveLength(1);

        // The renderer must have WAITED for the load: the detached microtask
        // `onServerPrefetch` replaced resolved after the HTML was flushed, so
        // the server paid for the request and still shipped an empty list.
        expect(html).toContain(entity.name);

        const snapshot : ListHydrationSnapshot<Analysis> | undefined = store.get(HYDRATION_KEY);
        expect(snapshot).toMatchObject({ total: 1, data: [{ id: entity.id }] });
    });

    it('should record nothing when the load fails, and still finish the render', async () => {
        const store = new Map<string, any>();

        const { app, coreClient } = createClientVueApp(host, {}, {
            // Returned, not thrown — the kit's own guidance: a throw on a
            // fire-and-forget path becomes an unhandled rejection and fails the
            // run instead of driving the client's error pipeline.
            core: { 'GET /analyses': () => fakeResponse(500, { message: 'boom' }) },
        }, { hydrationStore: store });

        const html = await renderToString(app);

        expect(coreClient.requests).toHaveLength(1);
        // The render finished rather than aborting on the rejection — it just
        // shipped the empty-list chrome.
        expect(html).toContain('No more analyses available...');

        // An adopted snapshot SUPPRESSES the client's own load, so recording
        // what a failed load left behind strands the list on an empty result
        // with no retry — a permanently blank page, not a slow one.
        expect(store.size).toBe(0);
    });

    it('should record nothing when the load never reached a response', async () => {
        const store = new Map<string, any>();

        // `analysisLog` is a DomainTypeMap key the core client carries no entity
        // API for, so `pickEntityAPI` yields undefined and `load()` returns
        // before issuing anything — the second half of "never record a failed
        // load", and the one the `loaded` flag exists for. A `try/catch` around
        // `await load()` cannot see this: the load RESOLVES, it just did nothing.
        // Recording here would hand the client an empty snapshot that suppresses
        // its own load for good.
        const inert = defineComponent({
            setup(props, setup) {
                createList({
                    type: DomainType.ANALYSIS_LOG, 
                    props: {}, 
                    setup, 
                });
                return () => h('div');
            },
        });

        const { app, coreClient } = createClientVueApp(inert, {}, {}, { hydrationStore: store });

        await renderToString(app);

        expect(coreClient.requests).toHaveLength(0);
        expect(store.size).toBe(0);
    });

    it('should record the composed query, which the client cannot re-derive', async () => {
        const entity = createTestAnalysis();
        const store = new Map<string, any>();

        const sorted = defineComponent({
            setup() {
                return () => h(
                    FAnalyses,
                    { query: { sorts: { updatedAt: 'DESC' } } },
                    { item: (props: { data: { name: string } }) => h('div', props.data.name) },
                );
            },
        });

        const { app } = createClientVueApp(sorted, {}, { core: { 'GET /analyses': () => ({ data: [entity], meta: { total: 1 } }) } }, { hydrationStore: store });

        await renderToString(app);

        // `query` is assigned only inside `load()`, and the adopting client
        // skips it. The socket handler reads its sorts to decide whether a
        // realtime-created entity belongs at the top of a full first page, so
        // without this the handoff silently disables realtime inserts.
        const snapshot : ListHydrationSnapshot<Analysis> | undefined = store.get(HYDRATION_KEY);
        expect(snapshot?.query).toMatchObject({ sorts: { updatedAt: 'DESC' } });
    });

    it('should not load at all when the host provides no store', async () => {
        const entity = createTestAnalysis();

        const { app, coreClient } = createClientVueApp(host, {}, { core: { 'GET /analyses': () => ({ data: [entity], meta: { total: 1 } }) } });

        const html = await renderToString(app);

        // Without a bucket the response could not reach the browser, so the
        // request is pure waste — and rows the hydrating client cannot
        // reproduce are a guaranteed mismatch.
        expect(coreClient.requests).toHaveLength(0);
        expect(html).not.toContain(entity.name);
    });
});
