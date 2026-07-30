/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientManager } from '@authup/core-realtime-kit';
import type { CTSEvents, STCEvents } from '@privateaim/core-realtime-kit';
import type { Pinia } from 'pinia';
import type { Socket } from 'socket.io-client';

export type SocketClient = Socket<STCEvents, CTSEvents>;
export type SocketClientManager = ClientManager<STCEvents, CTSEvents>;

export type SocketManagerInstallOptions = {
    baseURL: string,
    /**
     * Pinia instance backing authup's store. Required outside Nuxt: `app.use()`
     * invokes a plugin's `install` with no active injection context, so an
     * ambient `injectStore()` cannot resolve one.
     */
    pinia?: Pinia
};
