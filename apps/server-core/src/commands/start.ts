/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { LoggerInjectionKey } from '@privateaim/server-kit';
import { createApplication } from '../app/index.ts';
import { useEnv } from '../app/modules/config/index.ts';

export async function startCommand() {
    const app = createApplication();
    await app.setup();

    const logger = app.container.resolve(LoggerInjectionKey);

    logger.debug(`Environment: ${useEnv('env')}`);
    logger.debug(`Public-URL: ${useEnv('publicURL')}`);
    logger.debug(`Authup-URL: ${useEnv('authupURL')}`);
}
