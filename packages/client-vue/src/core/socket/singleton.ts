/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { App } from 'vue';
import { hasInjectionContext } from 'vue';
import { inject, provide } from '@authup/client-web-kit';
import type { SocketClientManager } from './types';

const SocketSymbol = Symbol.for('PSocket');

export function isSocketManagerUsable() {
    if (!hasInjectionContext()) {
        return false;
    }

    const instance = inject(SocketSymbol);
    return !!instance;
}

export function provideSocketManager(
    manager: SocketClientManager,
    app?: App,
) {
    provide(SocketSymbol, manager, app);
}

export function injectSocketManager(app?: App) : SocketClientManager {
    const manager = inject<SocketClientManager>(SocketSymbol, app);
    if (!manager) {
        throw new Error('The Socket Manager is not provided.');
    }

    return manager;
}
