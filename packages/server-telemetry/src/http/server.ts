/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Server } from 'node:http';
import http from 'node:http';
import { createNodeDispatcher } from 'routup';
import { createHTTPRouter } from './router';

export function createHttpServer() : Server {
    const router = createHTTPRouter();
    return new http.Server(createNodeDispatcher(router));
}
