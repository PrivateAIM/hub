/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { LoggerInjectionKey } from '@privateaim/server-kit';

export class SwaggerModule implements IModule {
    readonly name = 'swagger';

    readonly dependencies: string[] = ['config'];

    async setup(container: IContainer): Promise<void> {
        const logger = container.resolve(LoggerInjectionKey);

        logger.debug('Swagger generation skipped (use @trapi/cli)');
    }
}
