/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {STORE_ID, injectHTTPClient, useStore} from '@authup/client-web-kit';
import type {
    ClientResponseErrorTokenHookOptions,
} from '@authup/core-http-kit';
import {
    ClientResponseErrorTokenHook,
} from '@authup/core-http-kit';
import { APIClient as CoreAPIClient } from '@privateaim/core';
import { APIClient as StorageAPIClient } from '@privateaim/storage-kit';
import { storeToRefs } from 'pinia';
import { useRuntimeConfig } from '#imports';

declare module '#app' {
    interface NuxtApp {
        $coreAPI: CoreAPIClient;
        $storageAPI: StorageAPIClient;
    }
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $coreAPI: CoreAPIClient;
        $storageAPI: StorageAPIClient;
    }
}
export default defineNuxtPlugin((ctx) => {
    const runtimeConfig = useRuntimeConfig();

    const {
        coreUrl,
        storageUrl,
    } = runtimeConfig.public;

    // -----------------------------------------------------------------------------------

    const coreAPI = new CoreAPIClient({ baseURL: coreUrl });
    ctx.provide('coreAPI', coreAPI);

    // -----------------------------------------------------------------------------------

    const storageAPI = new StorageAPIClient({ baseURL: storageUrl });
    ctx.provide('storageAPI', storageAPI);

    // -----------------------------------------------------------------------------------

    const store = useStore();
    const { refreshToken } = storeToRefs(store);

    const authupAPI = injectHTTPClient();

    const tokenHookOptions : ClientResponseErrorTokenHookOptions = {
        baseURL: authupAPI.getBaseURL(),
        tokenCreator: () => {
            if (!refreshToken.value) {
                throw new Error('No refresh token available.');
            }

            return authupAPI.token.createWithRefreshToken({
                refresh_token: refreshToken.value,
            });
        },
        tokenCreated: (response) => {
            store.handleTokenGrantResponse(response);
        },
        tokenFailed: () => {
            store.logout();
        },
        timer: false,
    };

    const coreTokenHook = new ClientResponseErrorTokenHook(
        coreAPI,
        tokenHookOptions,
    );

    const storageTokenHook = new ClientResponseErrorTokenHook(
        storageAPI,
        tokenHookOptions,
    );

    store.$subscribe((mutation, state) => {
        if (mutation.storeId !== STORE_ID) return;

        if (state.accessToken) {
            coreAPI.setAuthorizationHeader({
                type: 'Bearer',
                token: state.accessToken,
            });

            storageAPI.setAuthorizationHeader({
                type: 'Bearer',
                token: state.accessToken,
            });

            coreTokenHook.mount();
            storageTokenHook.mount();
        } else {
            coreAPI.unsetAuthorizationHeader();
            storageAPI.unsetAuthorizationHeader();

            coreTokenHook.unmount();
            storageTokenHook.unmount();
        }
    });
});
