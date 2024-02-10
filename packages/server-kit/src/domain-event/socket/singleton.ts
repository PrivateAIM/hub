/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Emitter } from '@socket.io/redis-emitter';
import { useClient } from 'redis-extension';
import type { SocketResourcesNamespaceSTCEvents } from '@privateaim/core';

let instance : undefined | Emitter<SocketResourcesNamespaceSTCEvents>;

export function useSocketEmitter() : Emitter<SocketResourcesNamespaceSTCEvents> {
    if (typeof instance !== 'undefined') {
        return instance;
    }

    instance = new Emitter<SocketResourcesNamespaceSTCEvents>(useClient());

    return instance;
}
