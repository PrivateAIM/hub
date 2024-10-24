/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Client as BaseClient } from 'hapic';
import {
    StoreDispatcherEventName,
    injectHTTPClient,
    injectStoreDispatcher,
    injectStoreFactory,
    storeToRefs,
} from '@authup/client-web-kit';
import { ClientResponseErrorTokenHook } from '@authup/core-http-kit';
import type { App } from 'vue';

export function setupBaseHTTPClient(app: App, client: BaseClient) {
    const storeCreator = injectStoreFactory(app);
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
                store.applyTokenGrantResponse(response);
            },
            tokenFailed: () => {
                store.logout();
            },
            timer: false,
        },
    );

    const handleAccessTokenEvent = (token: string | null) => {
        if (token) {
            client.setAuthorizationHeader({
                type: 'Bearer',
                token,
            });

            tokenHook.mount();
        } else {
            client.unsetAuthorizationHeader();

            tokenHook.unmount();
        }
    };

    const dispatcher = injectStoreDispatcher(app);
    dispatcher.on(
        StoreDispatcherEventName.ACCESS_TOKEN_UPDATED,
        (token) => handleAccessTokenEvent(token),
    );

    handleAccessTokenEvent(store.accessToken);
}
