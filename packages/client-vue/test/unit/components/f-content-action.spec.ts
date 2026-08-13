/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import vuecs from '@vuecs/core';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import type { Router } from 'vue-router';
import { createMemoryHistory, createRouter } from 'vue-router';
import { describe, expect, it } from 'vitest';
import FContentAction from '../../../src/components/utility/content-action/FContentAction.vue';

/**
 * `FContentAction` needs no client-vue install — it talks to no HTTP client
 * and reads no authup store — so it mounts directly rather than through
 * `mountClientVueComponent`. It DOES need a router: `useRoute()` throws
 * without one.
 */
async function mountAt(path: string, props: Record<string, any> = {}) {
    const router: Router = createRouter({
        history: createMemoryHistory(),
        routes: [
            {
                path: '/:pathMatch(.*)*',
                component: defineComponent({ template: '<div />' }),
            },
        ],
    });

    await router.push(path);
    await router.isReady();

    return mount(FContentAction, {
        props: {
            overviewUrl: '/admin/clients',
            addUrl: '/admin/clients/add',
            ...props,
        },
        global: {
            // VCButton imports VCIcon directly; left live, @iconify/vue fetches
            // unknown names from the network and happy-dom aborts at teardown.
            stubs: { VCIcon: true },
            plugins: [[vuecs, {}], router],
        },
    });
}

describe('FContentAction', () => {
    it('renders the add action on the overview route', async () => {
        const wrapper = await mountAt('/admin/clients');

        expect(wrapper.text()).toContain('Add');
        expect(wrapper.text()).not.toContain('Back');
        expect(wrapper.find('[href="/admin/clients/add"]').exists()).toBe(true);
    });

    it('flips to a back action on the add route', async () => {
        const wrapper = await mountAt('/admin/clients/add');

        expect(wrapper.text()).toContain('Back');
        expect(wrapper.text()).not.toContain('Add');
        expect(wrapper.find('[href="/admin/clients"]').exists()).toBe(true);
    });

    /**
     * The reason the component is route-aware at all. `/projects` and
     * `/projects/in` are sibling list routes of one section, but the incoming
     * list is an approval queue — an "add" there would be the wrong verb for
     * the wrong audience.
     */
    it('renders nothing on a sibling route of the same section', async () => {
        const wrapper = await mountAt('/projects/in', {
            overviewUrl: '/projects',
            addUrl: '/projects/add',
        });

        expect(wrapper.text()).toBe('');
        expect(wrapper.find('a').exists()).toBe(false);
    });

    it('treats a trailing slash as the same route', async () => {
        const wrapper = await mountAt('/admin/clients/');

        expect(wrapper.text()).toContain('Add');
    });

    /**
     * `addDisabled` carries the create permission, so it has to actually
     * prevent navigation — not merely look inert.
     */
    it('disables the add action without permission', async () => {
        const wrapper = await mountAt('/admin/clients', { addDisabled: true });

        expect(wrapper.text()).toContain('Add');
        expect(wrapper.attributes('aria-disabled')).toBe('true');
    });

    it('never disables the back action', async () => {
        const wrapper = await mountAt('/admin/clients/add', { addDisabled: true });

        expect(wrapper.text()).toContain('Back');
        expect(wrapper.attributes('aria-disabled')).toBeUndefined();
    });
});
