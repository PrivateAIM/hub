/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { SocketMessagesNamespaceMessageParty } from '@privateaim/core-realtime-kit';
import { buildConnectionRobotRoom, buildConnectionUserRoom, mountConnectionController } from '@privateaim/server-realtime-kit';
import type { MessagesNamespace, MessagesNamespaceSocket } from './types';

export function registerMessagesNamespaceControllers(nsp: MessagesNamespace) {
    nsp.on('connection', (socket: MessagesNamespaceSocket) => {
        mountConnectionController(socket);

        socket.on('send', (data) => {
            if (!socket.data.userId && !socket.data.robotId) {
                return;
            }

            let from : SocketMessagesNamespaceMessageParty;
            if (socket.data.userId) {
                from = {
                    type: 'user',
                    id: socket.data.userId,
                };
            } else {
                from = {
                    type: 'robot',
                    id: socket.data.robotId,
                };
            }
            for (let i = 0; i < data.to.length; i++) {
                const to = data.to[i];
                if (to.type === 'user') {
                    nsp.in(buildConnectionUserRoom(to.id))
                        .emit('send', {
                            from,
                            data: data.data,
                            metadata: data.metadata,
                        });

                    continue;
                }

                nsp.in(buildConnectionRobotRoom(to.id))
                    .emit('send', {
                        from,
                        data: data.data,
                        metadata: data.metadata,
                    });
            }
        });
    });
}
