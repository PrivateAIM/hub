/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { config } from 'dotenv';
import { configure, useEnv } from './config';
import { setupDatabase } from './config/services';
import {
    createHttpServer,
    generateSwaggerDocumentation,
} from './http';

(async () => {
    config();

    await setupDatabase();
    configure();

    await generateSwaggerDocumentation();

    const httpServer = createHttpServer();

    function start() {
        const port = useEnv('port');
        httpServer.listen(port);

        console.log(`Listening on 0.0.0.0:${port}`);
    }

    start();
})();
