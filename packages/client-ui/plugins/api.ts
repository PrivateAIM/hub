/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ClientResponseErrorTokenHookOptions,
} from '@authup/core';
import {
    APIClient as AuthAPIClient,
    ClientResponseErrorTokenHook,
} from '@authup/core';
import { APIClient as CoreAPIClient } from '@privateaim/core';
import { APIClient as StorageAPIClient } from '@privateaim/storage-kit';
import type { Pinia } from 'pinia';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../store/auth';
import { useRuntimeConfig } from '#imports';

declare module '#app' {
    interface NuxtApp {
        $coreAPI: CoreAPIClient;
        $storageAPI: StorageAPIClient;
        $authupAPI: AuthAPIClient;
    }
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $coreAPI: CoreAPIClient;
        $storageAPI: StorageAPIClient;
        $authupAPI: AuthAPIClient;
    }
}
export default defineNuxtPlugin((ctx) => {
    const runtimeConfig = useRuntimeConfig();

    const {
        coreApiUrl,
        storageApiUrl,
        authupApiUrl,
    } = runtimeConfig.public;

    // -----------------------------------------------------------------------------------

    const coreAPI = new CoreAPIClient({ baseURL: coreApiUrl });
    ctx.provide('coreAPI', coreAPI);

    // -----------------------------------------------------------------------------------

    const storageAPI = new StorageAPIClient({ baseURL: storageApiUrl });
    ctx.provide('storageAPI', storageAPI);

    // -----------------------------------------------------------------------------------

    const authupAPI = new AuthAPIClient({ baseURL: authupApiUrl });
    ctx.provide('authupAPI', authupAPI);

    // -----------------------------------------------------------------------------------

    const store = useAuthStore(ctx.$pinia as Pinia);

    const authupTokenHookOptions : ClientResponseErrorTokenHookOptions = {
        baseURL: authupApiUrl,
        tokenCreator: () => {
            const { refreshToken } = storeToRefs(store);

            if (!refreshToken.value) {
                throw new Error('No refresh token available.');
            }

            return authupAPI.token.createWithRefreshToken({
                refresh_token: refreshToken.value,
            });
        },
        tokenCreated: (response) => {
            store.setAccessTokenExpireDate(undefined);

            setTimeout(() => {
                store.handleTokenGrantResponse(response);
            }, 0);
        },
        tokenFailed: () => {
            store.logout();
        },
    };

    const authupTokenHook = new ClientResponseErrorTokenHook(
        authupAPI,
        authupTokenHookOptions,
    );

    const tokenHookOptions : ClientResponseErrorTokenHookOptions = {
        ...authupTokenHookOptions,
        timer: false,
        tokenCreated(response) {
            authupTokenHook.setTimer(response);

            if (authupTokenHookOptions.tokenCreated) {
                authupTokenHookOptions.tokenCreated(response);
            }
        },
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
        if (mutation.storeId !== 'auth') return;

        if (state.accessToken) {
            coreAPI.setAuthorizationHeader({
                type: 'Bearer',
                token: state.accessToken,
            });

            storageAPI.setAuthorizationHeader({
                type: 'Bearer',
                token: state.accessToken,
            });

            authupAPI.setAuthorizationHeader({
                type: 'Bearer',
                token: state.accessToken,
            });

            coreTokenHook.mount();
            storageTokenHook.mount();
            authupTokenHook.mount();
        } else {
            coreAPI.unsetAuthorizationHeader();
            storageAPI.unsetAuthorizationHeader();
            authupAPI.unsetAuthorizationHeader();

            coreTokenHook.unmount();
            storageTokenHook.unmount();
            authupTokenHook.unmount();
        }
    });
});
