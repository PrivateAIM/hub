/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { serve } from 'routup';
import { LoggerInjectionKey } from '@privateaim/server-kit';
import { ConfigInjectionKey } from '../config/constants.ts';
import { createHttpApp } from '../../../adapters/http/index.ts';
import type { HTTPServer } from './constants.ts';
import { HTTPInjectionKey } from './constants.ts';

export class HTTPModule implements IModule {
    readonly name = 'http';

    readonly dependencies: string[] = ['config'];

    private instance: HTTPServer | undefined;

    async setup(container: IContainer): Promise<void> {
        const config = container.resolve(ConfigInjectionKey);
        const logger = container.resolve(LoggerInjectionKey);

        const app = createHttpApp();

        logger.debug('Starting http server...');

        const server = serve(app, {
            port: config.port,
            hostname: '0.0.0.0',
            silent: true,
            gracefulShutdown: false,
        });

        try {
            await server.ready();

            this.instance = server;

            if (server.url) {
                logger.debug(`Listening on ${server.url}`);
            }

            container.register(HTTPInjectionKey.Server, { useValue: server });
        } catch (e) {
            await server.close().catch(() => undefined);
            throw e;
        }
    }

    async teardown(container: IContainer): Promise<void> {
        if (!this.instance) return;

        container.unregister(HTTPInjectionKey.Server);

        await this.instance.close();
        this.instance = undefined;
    }
}
