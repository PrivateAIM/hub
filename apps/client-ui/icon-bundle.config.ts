/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import path from 'node:path';
import type { NuxtIconVitePluginOptions } from '@nuxt/icon/vite';

const repositoryRoot = path.resolve(import.meta.dirname, '..', '..');

/**
 * Options for `@nuxt/icon`'s standalone vite plugin, which bundles ONLY the
 * icons this app renders instead of registering the whole Font Awesome 6
 * solid + brands collections at runtime (1,902 icons, ~429 KB gzip, for the
 * 116 actually used).
 *
 * The plugin scans source for `<collection>:<name>` literals and emits them
 * into `virtual:nuxt-icon-bundle/register`, which registers through `addIcon`
 * from `@iconify/vue` — the same global store `<VCIcon>` resolves against, so
 * no component changes are needed.
 *
 * Kept out of `nuxt.config.ts` so `test/unit/icon-bundle.spec.ts` can drive
 * the real plugin with the real options: the glob list is LOAD-BEARING and
 * fails silently — a path that stops matching yields an empty icon slot in
 * the browser, not a build error.
 */
export const iconBundleOptions: NuxtIconVitePluginOptions = {
    // The repository root, so the globs below can reach the sibling workspace
    // packages AND so `@iconify-json/*` resolves from the hoisted node_modules.
    cwd: repositoryRoot,
    scan: {
        // Every source that can carry an icon name must be listed here.
        // `.ts` is part of the extensions (the plugin default covers
        // `.vue`/`.jsx`/`.tsx` only) because plenty of names live in plain
        // TypeScript modules — nav item tables, status maps, presets.
        globInclude: [
            // This app's own template/config tree.
            'apps/client-ui/*.vue',
            'apps/client-ui/{components,composables,config,core,layouts,middleware,pages,plugins,utils}/**/*.{vue,ts}',
            // Aliased to `src` in nuxt.config.ts, so its SOURCE — not its
            // dist — is what gets compiled into this app.
            'packages/client-vue/src/**/*.{vue,ts}',
            // Carries no icon name today; listed so a theme that later ships
            // icon defaults (the way vuecs presets do) works without a change
            // here.
            'packages/client-vue-theme/src/**/*.{vue,ts}',
            // Its components and identity-provider preset tables hold ~50 names.
            'node_modules/@authup/client-web-kit/dist/**/*.mjs',
            // Supplies the vuecs behavioral defaults (pagination arrows,
            // submit-button, alert icons, collapse chevrons). Those 11 names
            // exist in no hub source file, so omitting this path silently
            // empties those slots.
            'node_modules/@vuecs/icons-font-awesome/dist/*.mjs',
        ],
        // Overrides the plugin default, which ignores `node_modules` and
        // `dist` and would therefore drop the last two entries above.
        globExclude: [],
    },
};
