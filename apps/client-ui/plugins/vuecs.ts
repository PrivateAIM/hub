/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import vuecs from '@vuecs/core';
import clientWebKitTheme from '@authup/client-web-kit-theme';
import clientVueTheme from '@privateaim/client-vue-theme';
import fontAwesome from '@vuecs/icons-font-awesome';
import { addCollection } from '@iconify/vue';
import faBrands from '@iconify-json/fa6-brands/icons.json';
import faSolid from '@iconify-json/fa6-solid/icons.json';
import installButton from '@vuecs/button';
import installCountdown from '@vuecs/countdown';
import installElements from '@vuecs/elements';
import installForms from '@vuecs/forms';
import installIcon from '@vuecs/icon';
import installList from '@vuecs/list';
import installNavigation from '@vuecs/navigation';
import installOverlays from '@vuecs/overlays';
import installPagination from '@vuecs/pagination';
import installTable from '@vuecs/table';
import installTimeago from '@vuecs/timeago';

import { defineNuxtPlugin } from '#app';

addCollection(faSolid);
addCollection(faBrands);

export default defineNuxtPlugin({
    name: 'vuecs',
    dependsOn: ['authup'],
    setup: (ctx) => {
        ctx.vueApp.use(vuecs, {
            themes: [clientWebKitTheme(), clientVueTheme()],
            icons: [fontAwesome()],
        });

        ctx.vueApp.use(installButton);
        ctx.vueApp.use(installElements);
        ctx.vueApp.use(installForms);
        ctx.vueApp.use(installList);
        // Registry-only install (@vuecs/navigation 4.x): no item list and no
        // NavigationManager — each `<VCNavItems>` owns its items via `:data`.
        // Installed after `app.use(vuecs)` so the theme manager already carries
        // the configured themes before navigation's own theme-manager call runs.
        ctx.vueApp.use(installNavigation);
        ctx.vueApp.use(installOverlays);
        ctx.vueApp.use(installPagination);
        ctx.vueApp.use(installTable);
        ctx.vueApp.use(installIcon);

        ctx.vueApp.use(installCountdown);
        ctx.vueApp.use(installTimeago);
    },
});
