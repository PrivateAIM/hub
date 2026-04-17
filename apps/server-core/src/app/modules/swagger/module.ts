/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import path from 'node:path';
import { generateSwagger } from '@privateaim/server-http-kit';
import { LoggerInjectionKey } from '@privateaim/server-kit';
import { ConfigInjectionKey } from '../config/constants.ts';
import { getRootDirPath } from '../config/paths.ts';

export class SwaggerModule implements IModule {
    readonly name = 'swagger';

    readonly dependencies: string[] = ['config'];

    async setup(container: IContainer): Promise<void> {
        const config = container.resolve(ConfigInjectionKey);
        const logger = container.resolve(LoggerInjectionKey);

        logger.debug('Generating documentation...');

        await generateSwagger({
            authupURL: config.authupURL,
            baseURL: config.publicURL,
            cwd: getRootDirPath(),
            controllerBasePath: path.join(getRootDirPath(), 'src', 'adapters', 'http', 'controllers'),
        });

        logger.debug('Generated documentation.');
    }
}
