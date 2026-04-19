/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { LoggerInjectionKey } from '@privateaim/server-kit';
import { ConfigInjectionKey } from '../config/constants.ts';
import { createHttpServer } from '../../../adapters/http/index.ts';
import { HTTPInjectionKey } from './constants.ts';

export class HTTPModule implements IModule {
    readonly name = 'http';

    readonly dependencies: string[] = ['config'];

    async setup(container: IContainer): Promise<void> {
        const config = container.resolve(ConfigInjectionKey);
        const logger = container.resolve(LoggerInjectionKey);

        const server = createHttpServer();

        logger.debug('Starting http server...');

        await new Promise<void>((resolve, reject) => {
            const errorHandler = (err?: null | Error) => {
                reject(err);
            };

            server.once('error', errorHandler);
            server.once('listening', () => {
                server.removeListener('error', errorHandler);
                resolve();
            });

            server.listen(config.port, '0.0.0.0');
        });

        logger.debug(`Listening on 0.0.0.0:${config.port}.`);

        container.register(HTTPInjectionKey.Server, { useValue: server });
    }

    async teardown(container: IContainer): Promise<void> {
        const result = container.tryResolve(HTTPInjectionKey.Server);
        if (result.success) {
            await new Promise<void>((resolve, reject) => {
                result.data.close((error?: Error | null) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });
            });
        }
    }
}
