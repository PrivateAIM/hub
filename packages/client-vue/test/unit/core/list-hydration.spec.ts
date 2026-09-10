/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import {
    describe, 
    expect, 
    it, 
    vi,
} from 'vitest';
import { flushPromises } from '@vue/test-utils';
import type { Analysis } from '@privateaim/core-kit';
import { 
    defineComponent, 
    h, 
    nextTick, 
    useId, 
} from 'vue';
import { renderToString } from 'vue/server-renderer';
import FAnalyses from '../../../src/components/analysis/FAnalyses';
import type { ListHydrationSnapshot } from '../../../src/core';
import { createTestAnalysis } from '../../utils/factories';
import { createClientVueApp, mountClientVueComponent } from '../../utils';

// happy-dom always defines `window`, so `isServerRuntime()` is false for every
// mount below — these pin the CLIENT half of the handoff. The server half is in
// `list-hydration-ssr.spec.ts`, which runs on the node environment.

// The list derives its key from `useId()`, which Vue 3.5 numbers by position in
// the component tree — so a fresh app rendering this host always reaches the
// same value. Hard-coded rather than recomputed the way the implementation
// does: a spec that derived it identically would keep passing if BOTH drifted,
// and a drifted key is exactly the silent failure this suite exists to catch.
const HYDRATION_KEY = 'flame:list:analysis:v-0';

// The default item renderer (FAnalysisItem -> FAnalysis) has an async setup and
// needs a <Suspense> boundary the harness does not provide; the #item slot keeps
// these specs about the LIST.
const host = defineComponent({
    setup() {
        return () => h(FAnalyses, null, { item: (props: { data: { name: string } }) => h('div', { class: 'test-item' }, props.data.name) });
    },
});

function createSnapshot(entity: Analysis) : ListHydrationSnapshot<Analysis> {
    return {
        data: [entity],
        total: 1,
        meta: {
            pagination: { limit: 10, offset: 0 }, 
            total: 1, 
            busy: false, 
        },
    };
}

describe('core/list hydration (client)', () => {
    it('should adopt a matching snapshot instead of loading', async () => {
        const entity = createTestAnalysis();
        // `Map` already satisfies authup's `HydrationStore` port (get/set/delete),
        // so the fake is the standard library.
        const store = new Map<string, any>([[HYDRATION_KEY, createSnapshot(entity)]]);

        const { wrapper, coreClient } = mountClientVueComponent(host, {}, { core: { 'GET /analyses': () => ({ data: [entity], meta: { total: 1 } }) } }, { hydrationStore: store });

        await flushPromises();

        // Zero requests is the whole point — a client that re-fetches has paid
        // for the server render twice and can still disagree with its HTML.
        expect(coreClient.requests).toHaveLength(0);
        expect(wrapper.text()).toContain(entity.name);
    });

    it('should consume the snapshot, so a later mount loads again', async () => {
        const entity = createTestAnalysis();
        const store = new Map<string, any>([[HYDRATION_KEY, createSnapshot(entity)]]);

        const first = mountClientVueComponent(host, {}, { core: { 'GET /analyses': () => ({ data: [entity], meta: { total: 1 } }) } }, { hydrationStore: store });

        await flushPromises();
        expect(first.coreClient.requests).toHaveLength(0);

        // A collection goes stale, so the entry must not seed a client-side
        // navigation back to this route with the rows the server saw once.
        expect(store.size).toBe(0);

        const second = mountClientVueComponent(host, {}, { core: { 'GET /analyses': () => ({ data: [entity], meta: { total: 1 } }) } }, { hydrationStore: store });

        await flushPromises();
        expect(second.coreClient.requests).toHaveLength(1);
    });

    it('should load, and leave the store alone, when no entry matches the key', async () => {
        const entity = createTestAnalysis();
        const foreign = createSnapshot(entity);
        const store = new Map<string, any>([['flame:list:analysis:v-99', foreign]]);

        const { wrapper, coreClient } = mountClientVueComponent(host, {}, { core: { 'GET /analyses': () => ({ data: [entity], meta: { total: 1 } }) } }, { hydrationStore: store });

        await flushPromises();

        expect(coreClient.requests).toHaveLength(1);
        expect(wrapper.text()).toContain(entity.name);

        // Consume-on-read must not reach past its own key: another list's entry
        // stays until that list adopts it.
        expect(store.get('flame:list:analysis:v-99')).toBe(foreign);
    });

    it('should load as before when the host provides no store at all', async () => {
        const entity = createTestAnalysis();

        const { wrapper, coreClient } = mountClientVueComponent(host, {}, { core: { 'GET /analyses': () => ({ data: [entity], meta: { total: 1 } }) } });

        await flushPromises();

        expect(coreClient.requests).toHaveLength(1);
        expect(wrapper.text()).toContain(entity.name);
    });
});

describe('core/list hydration (round trip)', () => {
    it('should hydrate the server HTML without a mismatch', async () => {
        const entity = createTestAnalysis();
        const store = new Map<string, any>();
        const handlers = { core: { 'GET /analyses': () => ({ data: [entity], meta: { total: 1 } }) } };

        // `mount()` is always a fresh client render, so no other spec here ever
        // reaches Vue's hydration path — this one renders on one side of the
        // boundary and hydrates on the other, which is the only way the
        // "server HTML and first client render agree" claim is actually tested.
        //
        // `isServerRuntime()` reads `typeof window`, and happy-dom defines it —
        // unsetting the global is what puts `createListRaw` on its server branch.
        // The DOM stays available, which `renderToString` does not touch anyway.
        let html : string;
        vi.stubGlobal('window', undefined);
        try {
            const server = createClientVueApp(host, {}, handlers, { hydrationStore: store });
            html = await renderToString(server.app);
        } finally {
            // In a `finally` because vitest only auto-restores stubs when
            // `unstubGlobals` is configured: a render that threw would otherwise
            // leave every LATER spec in this file running without a `window`.
            vi.unstubAllGlobals();
        }

        expect(store.get(HYDRATION_KEY)).toBeDefined();
        expect(html).toContain(entity.name);

        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);

        // Captured BEFORE the mount so it can be compared by identity after it.
        // Every other assertion in this test also passes under a plain
        // `createApp` mount, which wipes the container and renders afresh —
        // i.e. without hydrating at all. Node identity is the one thing that
        // separates the two: a hydrating mount adopts the server's DOM nodes,
        // a fresh one replaces them.
        const rowBefore = container.querySelector('.test-item');
        expect(rowBefore).not.toBeNull();

        // Vue reports a mismatch through `console.error`, NOT through
        // `warnHandler` — an app-level handler alone would catch nothing and
        // assert nothing. Negative-controlled: dropping the store from the
        // client app below yields exactly one
        // "Hydration completed but contains mismatches." here.
        const errors : unknown[][] = [];
        const errorSpy = vi.spyOn(console, 'error').mockImplementation((...args) => {
            errors.push(args);
        });

        const client = createClientVueApp(host, {}, handlers, { hydrationStore: store });
        try {
            client.app.mount(container, true);
            await nextTick();
            await flushPromises();
        } finally {
            // Restored in a `finally` for the same reason as the window stub: a
            // failure here must not leave the rest of the file blind to errors.
            errorSpy.mockRestore();
        }

        expect(errors).toHaveLength(0);
        expect(client.coreClient.requests).toHaveLength(0);
        expect(container.textContent).toContain(entity.name);

        // It really hydrated: the row in the DOM is the SAME node the server's
        // HTML produced, not a re-render of it.
        expect(container.querySelector('.test-item')).toBe(rowBefore);

        client.app.unmount();
        container.remove();
    });

    it('should keep two lists on one page aligned across the boundary', async () => {
        const entity = createTestAnalysis();
        const store = new Map<string, any>();
        const handlers = { core: { 'GET /analyses': () => ({ data: [entity], meta: { total: 1 } }) } };

        // The shape the whole `useId` design rests on, and the one the other
        // specs cannot reach: a `useId` consumer INSIDE the first list, then a
        // second list of the same type after it.
        //
        // `onServerPrefetch` is what makes Vue mark a component as an async
        // boundary and give its subtree a fresh id counter. Register it only on
        // the server — the obvious reading — and the inner consumer draws from
        // the shared counter on the client but not on the server, which shifts
        // the SECOND list's id. It then derives the key the SERVER used for the
        // FIRST list and adopts the wrong rows, with `load()` suppressed so it
        // never corrects itself. Registering on both sides is what keeps the
        // two renders numbering identically.
        const inner = defineComponent({
            setup() {
                const id = useId();
                return () => h('span', { class: 'inner' }, id);
            },
        });

        const host2 = defineComponent({
            setup() {
                return () => h('div', [
                    h(FAnalyses, null, { item: () => h(inner) }),
                    h(FAnalyses, null, { item: (props: { data: { name: string } }) => h('div', props.data.name) }),
                ]);
            },
        });

        let html : string;
        vi.stubGlobal('window', undefined);
        try {
            const server = createClientVueApp(host2, {}, handlers, { hydrationStore: store });
            html = await renderToString(server.app);
        } finally {
            vi.unstubAllGlobals();
        }

        // Two lists, two distinct entries — neither may collide with the other.
        expect(store.size).toBe(2);

        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);

        const client = createClientVueApp(host2, {}, handlers, { hydrationStore: store });
        client.app.mount(container, true);
        await nextTick();
        await flushPromises();

        // Both adopted: every entry was claimed by the list that recorded it.
        expect(client.coreClient.requests).toHaveLength(0);
        expect(store.size).toBe(0);

        client.app.unmount();
        container.remove();
    });
});
