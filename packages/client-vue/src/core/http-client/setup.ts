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
import { ClientResponseErrorTokenHook, ClientResponseTokenHookEventName } from '@authup/core-http-kit';
import type { App } from 'vue';

export function setupBaseHTTPClient(app: App, client: BaseClient) {
    const storeCreator = injectStoreFactory(app);
    const store = storeCreator();
    const { refreshToken, accessToken } = storeToRefs(store);

    const authupClient = injectHTTPClient(app);

    const tokenHook = new ClientResponseErrorTokenHook(
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
            timer: false,
        },
    );

    tokenHook.on(ClientResponseTokenHookEventName.REFRESH_FINISHED, (response) => {
        store.applyTokenGrantResponse(response);
    });

    tokenHook.on(ClientResponseTokenHookEventName.REFRESH_FAILED, () => {
        store.logout();
    });

    if (accessToken.value) {
        tokenHook.mount(client);
    }

    const handleAccessTokenEvent = (token: string | null) => {
        if (token) {
            client.setAuthorizationHeader({
                type: 'Bearer',
                token,
            });

            tokenHook.mount(client);
        } else {
            client.unsetAuthorizationHeader();

            tokenHook.unmount(client);
        }
    };

    const dispatcher = injectStoreDispatcher(app);
    dispatcher.on(
        StoreDispatcherEventName.ACCESS_TOKEN_UPDATED,
        (token) => handleAccessTokenEvent(token),
    );

    handleAccessTokenEvent(store.accessToken);
}
