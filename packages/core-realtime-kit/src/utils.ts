/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { SocketResourcesNamespaceCTSEventCallback, SocketResourcesNamespaceCTSEventTarget } from './namespaces';

export function isSocketClientToServerEventTarget(
    input: unknown,
) : input is SocketResourcesNamespaceCTSEventTarget {
    return typeof input === 'number' ||
        typeof input === 'string' ||
        typeof input === 'undefined';
}
export function isSocketClientToServerEventCallback(
    input: unknown,
) : input is SocketResourcesNamespaceCTSEventCallback {
    return typeof input === 'function';
}

export function isSocketClientToServerEventErrorCallback(
    input: unknown,
) : input is SocketResourcesNamespaceCTSEventCallback {
    return isSocketClientToServerEventCallback(input) && input.length >= 1;
}
