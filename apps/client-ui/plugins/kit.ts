/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { install } from '@privateaim/client-vue';
import { defineNuxtPlugin, useRuntimeConfig } from '#imports';

export default defineNuxtPlugin((ctx) => {
    // The private (server-side) addresses exist only during the server
    // render; they apply when a server-side core URL is set, and each one
    // falls back to its public address.
    const {
        coreUrl,
        storageUrl,
        telemetryUrl,
        public: publicConfig,
    } = useRuntimeConfig();

    ctx.vueApp.use(install, {
        coreURL: coreUrl || publicConfig.coreUrl,
        storageURL: (coreUrl && storageUrl) || publicConfig.storageUrl,
        telemetryURL: (coreUrl && telemetryUrl) || publicConfig.telemetryUrl,
        // An unanswered API call would otherwise stall an SSR render forever.
        httpTimeout: 30_000,
        // `installSocketManager` is opt-in as of the contract-first client work;
        // without this, realtime silently stops working.
        realtime: true,
    });
});
