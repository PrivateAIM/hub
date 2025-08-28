/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useLogger } from '@privateaim/server-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import type { Namespace, Server } from '../types';

export function mountLoggingMiddleware(
    nsp: Namespace | Server,
) {
    nsp.on('error', (err) => {
        useLogger().error(err, {
            [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
        });
    });

    nsp.use((socket, next) => {
        useLogger().debug(`Socket/${socket.id}: Connected.`, {
            namespace: socket.nsp.name,
            [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
        });

        socket.on('disconnect', () => {
            useLogger().debug(`Socket/${socket.id}: Disconnected.`, {
                namespace: socket.nsp.name,
                [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
            });
        });

        next();
    });
}
