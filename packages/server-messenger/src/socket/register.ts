/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { mountConnectionController, mountMessagingController } from './controllers/index.ts';
import type { Server, Socket } from './types.ts';

export function registerControllers(server: Server) {
    server.on('connection', (socket: Socket) => {
        mountConnectionController(socket);
        mountMessagingController(socket);
    });
}
