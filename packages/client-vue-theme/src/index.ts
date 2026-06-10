/*
 * Copyright (c) 2024-2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineTheme, extend } from '@vuecs/core';

export { default as clientWebKitTheme, merge } from '@authup/client-web-kit-theme';

/**
 * App-level theme. Layers PrivateAIM app-specific concerns (Bootstrap-compat
 * class shims, heading scale, brand tokens) on top of the kit theme.
 *
 * Consumers register both themes — order matters: the kit-level theme
 * first so its element class strings are the baseline, then the app
 * theme so its overrides win:
 *
 *     import clientWebKitTheme from '@authup/client-web-kit-theme';
 *     import clientVueTheme from '@privateaim/client-vue-theme';
 *
 *     app.use(vuecs, {
 *         themes: [clientWebKitTheme(), clientVueTheme()],
 *     });
 *
 * Reskinning (palette swap, dark mode) is handled by redefining
 * `--vc-color-*` variables — `setColorPalette()` from
 * `@vuecs/theme-tailwind` or toggling `.dark` on `<html>` works without
 * any theme configuration here.
 */
export default function clientVueTheme() {
    return defineTheme({
        elements: {
            tableHeadCell: { classes: { root: 'px-3 font-medium' } },
            /*
             * Hovering / focusing a page button previews the active-page
             * paint ("click → this page"). `extend()` appends to the
             * theme-tailwind base `link` classes; the `!` suffix wins over
             * per-variant hover utilities the same way the stock
             * `linkActive` classes do. `enabled:` keeps disabled
             * first/prev/next/last buttons unpainted.
             */
            pagination: {
                classes: {
                    link: extend(
                        'enabled:hover:bg-primary-600! enabled:hover:text-on-primary! enabled:hover:border-primary-600! ' +
                        'enabled:focus-visible:bg-primary-600! enabled:focus-visible:text-on-primary! enabled:focus-visible:border-primary-600!',
                    ),
                },
            },
        },
    });
}
