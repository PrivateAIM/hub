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

    let coreURL : string | undefined;
    if (runtimeConfig.coreUrl) {
        coreURL = runtimeConfig.coreUrl as string;
    } else {
        coreURL = runtimeConfig.public.coreUrl;
    }

    let storageURL : string | undefined;
    if (runtimeConfig.coreUrl) {
        storageURL = runtimeConfig.storageUrl as string;
    } else {
        storageURL = runtimeConfig.public.storageUrl;
    }

    ctx.vueApp.use(install, {
        coreURL,
        storageURL,
    });
});
