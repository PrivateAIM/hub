/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { setup, useEnv } from './config';
import { createHttpServer } from './http';

(async () => {
    await setup();

    const httpServer = createHttpServer();

    function start() {
        const port = useEnv('port');
        httpServer.listen(port);

        console.log(`Listening on 0.0.0.0:${port}`);
    }

    start();
})();
