/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useLogger } from '@privateaim/server-kit';
import { config } from 'dotenv';
import path from 'node:path';
import process from 'node:process';
import { configure, useEnv } from './config';
import { createHttpServer } from './http';
import { createSocketServer } from './socket';

config({
    debug: false,
    path: path.resolve(process.cwd(), 'env'),
});

(async () => {
    /*
    HTTP Server & Express App
    */

    configure();

    const httpServer = createHttpServer();
    const socketServer = createSocketServer(httpServer);

    /*
    Start Server
    */
    function start() {
        const port = useEnv('port');
        httpServer.listen(port);

        useLogger().debug(`Listening on 0.0.0.0:${port}`);
        useLogger().debug(`Socket.io server mounted on path: ${socketServer.path()}`);
    }

    start();
})();
