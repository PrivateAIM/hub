/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ClientAuthenticationHook } from '@authup/core-http-kit';
import type { Factory } from 'singa';
import { singa } from 'singa';

const instance = singa<ClientAuthenticationHook>({
    name: 'clientAuthenticationHook',
});

export function setClientAuthenticationHookFactory(factory: Factory<ClientAuthenticationHook>) {
    instance.setFactory(factory);
}

export function isClientAuthenticationHookUsable() {
    return instance.has() || instance.hasFactory();
}

export function useClientAuthenticationHook() {
    return instance.use();
}
