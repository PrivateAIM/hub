/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    CTSMessagingEventName,
    CTSMessagingMessageValidator,
    STCMessagingEventName,
} from '@privateaim/messenger-kit';
import type {
    CTSMessagingMessage,
    CTSMessagingParty,
} from '@privateaim/messenger-kit';
import { useLogger } from '@privateaim/server-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import type { Socket } from '../../types.ts';
import { buildConnectionRobotRoom, buildConnectionUserRoom } from '../connection/index.ts';

export function mountMessagingController(socket: Socket) {
    const validator = new CTSMessagingMessageValidator();

    socket.on(CTSMessagingEventName.SEND, async (raw, cb) => {
        if (!socket.data.userId && !socket.data.robotId) {
            return;
        }

        let data :CTSMessagingMessage;

        try {
            data = await validator.run(raw);
        } catch (e) {
            useLogger()
                .error(e);

            if (typeof cb === 'function') {
                cb(e);
            }

            return;
        }

        let from : CTSMessagingParty;
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

            useLogger()
                .info(`Sending message from ${from.id} (${from.type}) to ${to.id} (${to.type})`, {
                    [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                    actor_type: from.type,
                    actor_id: from.id,
                });

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

        if (typeof cb === 'function') {
            cb(null);
        }
    });
}
