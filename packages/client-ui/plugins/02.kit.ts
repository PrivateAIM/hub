/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { install } from '@privateaim/client-vue';
import { defineNuxtPlugin, useRuntimeConfig } from '#imports';

export default defineNuxtPlugin((ctx) => {
    const runtimeConfig = useRuntimeConfig();

    ctx.vueApp.use(install, {
        coreURL: runtimeConfig.public.coreUrl,
        storageURL: runtimeConfig.public.storageUrl,
        realtimeURL: runtimeConfig.public.realtimeUrl,
    });
});
