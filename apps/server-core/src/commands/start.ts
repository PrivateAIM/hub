/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConfigInjectionKey, LoggerInjectionKey } from '@privateaim/server-kit';
import { createApplication } from '../app/index.ts';

export async function startCommand() {
    const app = createApplication();
    await app.setup();

    const logger = app.container.resolve(LoggerInjectionKey);
    const config = app.container.resolve(ConfigInjectionKey);

    logger.debug(`Environment: ${config.env}`);
    logger.debug(`Public-URL: ${config.publicURL}`);
    logger.debug(`Authup-URL: ${config.authupURL}`);
}
