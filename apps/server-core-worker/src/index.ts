/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import 'dotenv/config';
import { LoggerInjectionKey } from '@privateaim/server-kit';
import { createApplication } from './app';
import { useEnv } from './app/modules/config';

async function start() {
    const app = createApplication();
    await app.setup();

    const logger = app.container.resolve(LoggerInjectionKey);

    logger.debug(`Environment: ${useEnv('env')}`);
    logger.debug(`Authup-URL: ${useEnv('authupURL')}`);
}

start();
