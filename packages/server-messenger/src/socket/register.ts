/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { mountConnectionController } from '@privateaim/server-realtime-kit';
import { mountMessagingController } from './controllers';
import type { Server, Socket } from './types';

export function registerControllers(server: Server) {
    server.on('connection', (socket: Socket) => {
        mountConnectionController(socket);
        mountMessagingController(socket);
    });
}
