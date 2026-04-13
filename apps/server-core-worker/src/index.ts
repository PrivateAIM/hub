/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useLogger } from '@privateaim/server-kit';
import { createConfig, useEnv } from './config';
import { createHttpServer } from './http';

const config = createConfig();
const server = createHttpServer();

function start() {
    config.components.forEach((c) => c.start());
    config.aggregators.forEach((a) => a.start());

    const port = useEnv('port');
    server.listen(port);

    useLogger().debug(`Listening on 0.0.0.0:${port}`);
}

start();
