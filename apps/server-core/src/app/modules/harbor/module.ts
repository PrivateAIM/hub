/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { withDataSourceLock } from '@privateaim/server-db-kit';
import { LoggerInjectionKey } from '@privateaim/server-kit';
import { setupHarborService } from '../../../core/harbor/module.ts';
import { ConfigInjectionKey } from '../config/constants.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { HARBOR_SETUP_DATABASE_LOCK } from './constants.ts';

export class HarborModule implements IModule {
    readonly name = 'harbor';

    readonly dependencies: string[] = ['config', 'database'];

    async setup(container: IContainer): Promise<void> {
        const config = container.resolve(ConfigInjectionKey);

        if (!config.harborURL) {
            return;
        }

        const logger = container.resolve(LoggerInjectionKey);

        logger.debug('Executing harbor service setup...');

        const dataSource = container.resolve(DatabaseInjectionKey.DataSource);
        const registryRepository = container.resolve(DatabaseInjectionKey.RegistryRepository);

        await withDataSourceLock(
            dataSource,
            HARBOR_SETUP_DATABASE_LOCK,
            () => setupHarborService({
                harborURL: config.harborURL,
                registryRepository,
            }),
        );

        logger.debug('Executed harbor service setup.');
    }
}
