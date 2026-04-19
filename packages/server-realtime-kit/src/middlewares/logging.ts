/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import type { Namespace, Server } from '../types';

type LoggingMiddlewareOptions = {
    logger: Logger,
};

export function mountLoggingMiddleware(
    nsp: Namespace | Server,
    options: LoggingMiddlewareOptions,
) {
    const { logger } = options;

    nsp.on('error', (err) => {
        logger.error(err, { [LogFlag.CHANNEL]: LogChannel.WEBSOCKET });
    });

    nsp.use((socket, next) => {
        logger.debug(`Socket/${socket.id}: Connected.`, {
            namespace: socket.nsp.name,
            [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
        });

        socket.on('disconnect', () => {
            logger.debug(`Socket/${socket.id}: Disconnected.`, {
                namespace: socket.nsp.name,
                [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
            });
        });

        next();
    });
}
