/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Middleware, Server,
} from '@privateaim/server-realtime-kit';

export type SocketNamespaceContext = {
    server: Server,
    authMiddleware: Middleware
};
