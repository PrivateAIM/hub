/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useLogger } from '@privateaim/server-kit';
import http from 'node:http';
import { Router, coreHandler, createNodeDispatcher } from 'routup';
import { setupConfig, useEnv } from './config';
import { createSocketServer } from './socket';

(async () => {
    /*
    HTTP Server & Express App
    */
    setupConfig();

    const router = new Router();

    router.get('/', coreHandler(() => ({
        timestamp: Date.now(),
    })));

    const httpServer = new http.Server(createNodeDispatcher(router));
    const socketServer = createSocketServer(httpServer, {
        authupURL: useEnv('authupApiURL'),
    });

    /*
    Start Server
    */
    function start() {
        const port = useEnv('port');
        httpServer.listen(port);

        useLogger().info(`Listening on 0.0.0.0:${port}`);
        useLogger().info(`Socket.io server mounted on path: ${socketServer.path()}`);
    }

    start();
})();
