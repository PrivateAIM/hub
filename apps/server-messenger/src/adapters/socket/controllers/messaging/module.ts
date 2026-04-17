/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isError } from '@privateaim/kit';
import {
    CTSMessagingEventName,
    CTSMessagingMessageValidator,
    STCMessagingEventName,
} from '@privateaim/messenger-kit';
import type {
    CTSMessagingMessage,
} from '@privateaim/messenger-kit';
import { useLogger } from '@privateaim/server-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import type { Socket } from '../../types.ts';
import {
    buildConnectionRoomForIdentity,
} from '../connection/index.ts';

export function mountMessagingController(socket: Socket) {
    const validator = new CTSMessagingMessageValidator();

    socket.on(CTSMessagingEventName.SEND, async (raw, cb) => {
        if (!socket.data.identity) {
            if (typeof cb === 'function') {
                cb(new Error('You are not authenticated as client, robot or user.'));
            }
            return;
        }

        let data :CTSMessagingMessage;

        try {
            data = await validator.run(raw);
        } catch (e) {
            if (isError(e)) {
                useLogger()
                    .error(e);

                if (typeof cb === 'function') {
                    cb(e);
                }
            }

            return;
        }

        const from = socket.data.identity;

        for (let i = 0; i < data.to.length; i++) {
            const to = data.to[i];

            useLogger()
                .info(`Sending message from ${from.id} (${from.type}) to ${to.id} (${to.type})`, {
                    [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                    actor_type: from.type,
                    actor_id: from.id,
                });

            socket.in(buildConnectionRoomForIdentity(to))
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
