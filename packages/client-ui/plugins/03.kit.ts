/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { type Options, install } from '@privateaim/client-vue';
import type { APIClient as CoreAPIClient } from '@privateaim/core';
import type { APIClient as StorageAPIClient } from '@privateaim/storage-kit';
import { defineNuxtPlugin, useRuntimeConfig } from '#imports';

export default defineNuxtPlugin((ctx) => {
    const runtimeConfig = useRuntimeConfig();

    const options : Options = {
        coreAPIClient: ctx.$coreAPI as CoreAPIClient,
        storageAPIClient: ctx.$storageAPI as StorageAPIClient,

        realtimeURL: runtimeConfig.public.realtimeUrl ??
            'http://localhost:3001/',
    };

    ctx.vueApp.use(install, options);
});
