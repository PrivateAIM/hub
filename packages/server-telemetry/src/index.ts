/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { generateSwagger } from '@privateaim/server-http-kit';
import type { Component } from '@privateaim/server-kit';
import { useLogger } from '@privateaim/server-kit';
import dotenv from 'dotenv';
import path from 'node:path';
import process from 'node:process';
import { defineEventComponent } from './components';
import { configure, useEnv } from './config';
import { setupDatabase } from './config/services';
import {
    createHttpServer,
} from './http';

(async () => {
    dotenv.config({
        debug: false,
        quiet: true,
    });

    await setupDatabase();

    configure();

    const components : Component[] = [
        defineEventComponent(),
    ];

    await generateSwagger({
        authupURL: useEnv('authupURL'),
        baseURL: useEnv('publicURL'),
        controllerBasePath: path.join(process.cwd(), 'src', 'http', 'controllers'),
    });

    const httpServer = createHttpServer();

    function start() {
        components.forEach((c) => c.start());

        const port = useEnv('port');
        httpServer.listen(port);

        useLogger().info(`Listening on 0.0.0.0:${port}`);
    }

    start();
})();
