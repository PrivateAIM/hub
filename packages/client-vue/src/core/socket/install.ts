/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { storeToRefs, useStore } from '@authup/client-web-kit';
import { ClientManager } from '@authup/core-realtime-kit';
import type { CTSEvents, STCEvents } from '@privateaim/core-realtime-kit';
import type { App } from 'vue';
import { ref } from 'vue';
import { provideSocketManager } from './singleton';
import type { SocketManagerInstallOptions } from './types';

export function installSocketManager(app: App, options: SocketManagerInstallOptions) {
    const store = useStore();
    const { accessToken } = storeToRefs(store);

    const manager = new ClientManager<
    STCEvents,
    CTSEvents
    >({
        url: options.baseURL,
        token: () => accessToken.value,
    });

    const oldValue = ref<string | undefined>();

    store.$subscribe((
        mutation,
        state,
    ) => {
        if (state.accessToken !== oldValue.value) {
            oldValue.value = state.accessToken;

            Promise.resolve()
                .then(() => manager.reconnect());
        }
    });

    provideSocketManager(manager, app);
}
