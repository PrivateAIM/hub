/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import vuecs from '@vuecs/core';
import installButton from '@vuecs/button';
import installCountdown from '@vuecs/countdown';
import installElements from '@vuecs/elements';
import installForms from '@vuecs/forms';
import installList from '@vuecs/list';
import installOverlays from '@vuecs/overlays';
import installPagination from '@vuecs/pagination';
import installTable from '@vuecs/table';
import installTimeago from '@vuecs/timeago';

import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin({
    name: 'vuecs',
    dependsOn: ['authup'],
    setup: (ctx) => {
        ctx.vueApp.use(vuecs);

        ctx.vueApp.use(installButton);
        ctx.vueApp.use(installElements);
        ctx.vueApp.use(installForms);
        ctx.vueApp.use(installList);
        ctx.vueApp.use(installOverlays);
        ctx.vueApp.use(installPagination);
        ctx.vueApp.use(installTable);

        ctx.vueApp.use(installCountdown);
        ctx.vueApp.use(installTimeago);
    },
});
