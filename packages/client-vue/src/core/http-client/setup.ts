/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client as BaseClient } from 'hapic';
import {
    STORE_ID, injectHTTPClient, injectStore, storeToRefs,
} from '@authup/client-web-kit';
import { ClientResponseErrorTokenHook } from '@authup/core-http-kit';
import type { App } from 'vue';

export function setupBaseHTTPClient(app: App, client: BaseClient) {
    const storeCreator = injectStore(app);
    const store = storeCreator();
    const { refreshToken } = storeToRefs(store);

    const authupClient = injectHTTPClient(app);

    const tokenHook = new ClientResponseErrorTokenHook(
        client,
        {
            baseURL: authupClient.getBaseURL(),
            tokenCreator: () => {
                if (!refreshToken.value) {
                    throw new Error('No refresh token available.');
                }

                return authupClient.token.createWithRefreshToken({
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
        },
    );

    store.$subscribe((mutation, state) => {
        if (mutation.storeId !== STORE_ID) return;

        if (state.accessToken) {
            client.setAuthorizationHeader({
                type: 'Bearer',
                token: state.accessToken,
            });

            tokenHook.mount();
        } else {
            client.unsetAuthorizationHeader();

            tokenHook.unmount();
        }
    });
}
