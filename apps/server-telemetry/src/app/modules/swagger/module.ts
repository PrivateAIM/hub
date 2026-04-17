/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import path from 'node:path';
import process from 'node:process';
import { generateSwagger } from '@privateaim/server-http-kit';
import { ConfigInjectionKey } from '../config/constants.ts';

export class SwaggerModule implements IModule {
    readonly name = 'swagger';

    readonly dependencies: string[] = ['config'];

    async setup(container: IContainer): Promise<void> {
        const config = container.resolve(ConfigInjectionKey);

        await generateSwagger({
            authupURL: config.authupURL,
            baseURL: config.publicURL,
            controllerBasePath: path.join(process.cwd(), 'src', 'adapters', 'http', 'controllers'),
        });
    }
}
