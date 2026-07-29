/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    StoreDispatcherEventName, 
    injectStore, 
    injectStoreDispatcher, 
    storeToRefs,
} from '@authup/client-web-kit';
import { ClientManager } from '@authup/core-realtime-kit';
import type { CTSEvents, STCEvents } from '@privateaim/core-realtime-kit';
import type { App } from 'vue';
import { provideSocketManager } from './singleton';
import type { SocketManagerInstallOptions } from './types';

export function installSocketManager(app: App, options: SocketManagerInstallOptions) {
    // Both injects MUST be passed the app explicitly. Vue's `app.use(plugin)`
    // calls `plugin.install(app, ...)` bare, setting neither `currentInstance`
    // nor `currentApp`, so `hasInjectionContext()` is false and an ambient
    // inject resolves to undefined -> 'The store factory has not been injected
    // in the app context.' It only appeared to work under Nuxt because plugins
    // there run inside `vueApp.runWithContext()`.
    const store = injectStore(options.pinia, app);
    const { accessToken } = storeToRefs(store);

    const manager = new ClientManager<
        STCEvents,
        CTSEvents
    >({
        url: options.baseURL,
        token: () => accessToken.value,
    });

    const storeDispatcher = injectStoreDispatcher(app);
    storeDispatcher.on(
        StoreDispatcherEventName.ACCESS_TOKEN_UPDATED,
        () => {
            Promise.resolve()
                .then(() => manager.reconnect());
        },
    );

    provideSocketManager(manager, app);
}
