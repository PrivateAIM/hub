/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ConfigInjectionKey, LoggerInjectionKey } from '@privateaim/server-kit';
import { defineCommand } from 'citty';
import { createApplication } from '../../app/index.ts';

export function defineCLIStartCommand() {
    return defineCommand({
        meta: { name: 'start' },
        async setup() {
            const app = createApplication();
            await app.setup();

            const logger = app.container.resolve(LoggerInjectionKey);
            const config = app.container.resolve(ConfigInjectionKey);

            logger.debug(`Environment: ${config.env}`);
            logger.debug(`Public-URL: ${config.publicURL}`);
        },
    });
}
