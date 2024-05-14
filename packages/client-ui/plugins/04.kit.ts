/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useStore } from '@authup/client-web-kit';
import type { Options, SocketManager } from '@privateaim/client-vue';
import { install } from '@privateaim/client-vue';
import type { APIClient as CoreAPIClient } from '@privateaim/core';
import type { APIClient as StorageAPIClient } from '@privateaim/storage-kit';
import { ref } from 'vue';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((ctx) => {
    const authupStore = useStore();
    const socketManager = (ctx.$socket as SocketManager);

    const accessToken = ref<string | undefined>();

    authupStore.$subscribe((
        mutation,
        state,
    ) => {
        if (state.accessToken !== accessToken.value) {
            accessToken.value = state.accessToken;
            socketManager.reconnect();
        }
    });

    const options : Options = {
        coreAPIClient: ctx.$coreAPI as CoreAPIClient,
        storageAPIClient: ctx.$storageAPI as StorageAPIClient,
        socketManager,
    };

    ctx.vueApp.use(install, options);
});
