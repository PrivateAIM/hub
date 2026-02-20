/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useLogger } from '@privateaim/server-kit';
import { defineCommand } from 'citty';
import { configure, useEnv } from '../../config/index.ts';
import { createHttpServer } from '../../http/index.ts';
import { createSocketServer } from '../../socket/index.ts';

export function defineCLIStartCommand() {
    return defineCommand({
        meta: {
            name: 'start',
        },
        async setup() {
            configure();

            const logger = useLogger();

            const httpServer = createHttpServer();
            const socketServer = createSocketServer(httpServer);

            httpServer.on('error', (err) => {
                logger.error(`HTTP server error: ${err.message}`);
                process.exit(1);
            });

            const port = useEnv('port');
            httpServer.listen(port, () => {
                logger.debug(`Listening on 0.0.0.0:${port}`);
                logger.debug(`Socket.io server mounted on path: ${socketServer.path()}`);
            });
        },
    });
}
