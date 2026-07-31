/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { NuxtIconBundle } from '@nuxt/icon/vite';
import {
    beforeAll, 
    describe, 
    expect, 
    it,
} from 'vitest';
import { iconBundleOptions } from '../../icon-bundle.config.ts';

/**
 * The app bundles only the icons it renders instead of registering both full
 * Font Awesome collections. The plugin discovers icon names by SCANNING
 * source, so its glob list is load-bearing and fails silently: a path that
 * stops matching yields an empty icon slot in the browser, not a build error.
 *
 * Each glob that contributes icons is pinned below by a name that can come
 * from it and from nowhere else. (`packages/client-vue-theme` carries no icon
 * name today, so there is nothing to pin it with.)
 *
 * This drives the real plugin with the real options rather than asserting
 * against a built bundle: `load()` performs the whole scan → resolve →
 * generate path on its own, so the guard needs no `nuxi build` output — which
 * CI's build cache does not carry anyway. Asserting against a rendered page
 * would not work at all, since `@iconify/vue` resolves icons client-side and
 * SSR output carries empty `<svg>` shells either way.
 */
// The `load` hook declares a rollup `PluginContext` receiver it never touches,
// so it is callable standalone — but only through a signature that says so.
type StandaloneLoad = (id: string) => unknown;

type IconCollection = {
    prefix?: string,
    icons: Record<string, unknown>
};

describe('icon-bundle', () => {
    let registered: Set<string>;

    beforeAll(async () => {
        const { load } = NuxtIconBundle(iconBundleOptions);
        const hook = typeof load === 'function' ? load : load?.handler;

        if (typeof hook !== 'function') {
            throw new Error('@nuxt/icon no longer exposes a `load` hook');
        }

        // The plugin resolves its own virtual module id to a `\0`-prefixed one.
        const code = await (hook as StandaloneLoad)('\0virtual:nuxt-icon-bundle');

        if (typeof code !== 'string') {
            throw new Error('the `load` hook did not emit the icon bundle');
        }

        // Emitted as `const collections = JSON.parse("<json>")`, so the inner
        // literal parses twice: once as the JS string, once as the payload.
        const [, payload] = /JSON\.parse\((".*")\)/s.exec(code) || [];

        if (!payload) {
            throw new Error('the emitted bundle no longer carries a JSON payload');
        }

        const collections = JSON.parse(JSON.parse(payload)) as IconCollection[];

        registered = new Set(collections.flatMap((collection) => Object
            .keys(collection.icons)
            .map((name) => (collection.prefix ? `${collection.prefix}:${name}` : name))));
    });

    it('should bundle an icon only the vuecs preset references', () => {
        // The pagination "first page" default, from @vuecs/icons-font-awesome.
        expect(registered).toContain('fa6-solid:angles-left');
    });

    it('should bundle an icon only the authup kit references', () => {
        // From the kit's identity-provider preset table.
        expect(registered).toContain('fa6-brands:gitlab');
    });

    it('should bundle an icon only client-vue references', () => {
        // FAnalysisBuildStep's build-OS icon.
        expect(registered).toContain('fa6-brands:linux');
    });

    it('should bundle an icon only this app references', () => {
        // The "analyses" navigation item.
        expect(registered).toContain('fa6-solid:atom');
    });

    it('should not bundle the full font-awesome collections', () => {
        // Two icons no hub source references. Their presence means the subset
        // degraded back into a full-collection registration.
        expect(registered).not.toContain('fa6-solid:chess-knight');
        expect(registered).not.toContain('fa6-solid:bacterium');
    });
});
