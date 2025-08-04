/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { generateSwagger } from '@privateaim/server-http-kit';
import { config } from 'dotenv';
import path from 'node:path';
import process from 'node:process';
import { configure, useEnv } from './config';
import { setupDatabase } from './config/services';
import {
    createHttpServer,
} from './http';

(async () => {
    config();

    await setupDatabase();
    configure();

    await generateSwagger({
        authupURL: useEnv('authupURL'),
        baseURL: useEnv('publicURL'),
        controllerBasePath: path.join(process.cwd(), 'src', 'http', 'controllers'),
    });

    const httpServer = createHttpServer();

    function start() {
        const port = useEnv('port');
        httpServer.listen(port);

        console.log(`Listening on 0.0.0.0:${port}`);
    }

    start();
})();
