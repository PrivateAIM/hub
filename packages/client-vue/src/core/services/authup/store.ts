/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { injectStore, provideStore } from '@authup/client-web-kit';
import type { App } from 'vue';

export type AuthupStore = ReturnType<typeof injectStore>;
export function injectAuthupStore() : AuthupStore {
    return injectStore();
}

export function provideAuthupStore(
    store: AuthupStore,
    instance?: App,
) {
    provideStore(store, instance);
}
