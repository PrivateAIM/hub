/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { CTSMessagingEventName, STCMessagingEventName } from '@privateaim/messenger-kit';
import type { MessagingParty } from '@privateaim/messenger-kit';
import type { Socket } from '../../types';
import { buildConnectionRobotRoom, buildConnectionUserRoom } from '../connection';

export function mountMessagingController(socket: Socket) {
    socket.on(CTSMessagingEventName.SEND, (data) => {
        if (!socket.data.userId && !socket.data.robotId) {
            return;
        }

        let from : MessagingParty;
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
                socket.in(buildConnectionUserRoom(to.id))
                    .emit(STCMessagingEventName.SEND, {
                        from,
                        data: data.data,
                        metadata: data.metadata,
                    });

                continue;
            }

            socket.in(buildConnectionRobotRoom(to.id))
                .emit(STCMessagingEventName.SEND, {
                    from,
                    data: data.data,
                    metadata: data.metadata,
                });
        }
    });
}
