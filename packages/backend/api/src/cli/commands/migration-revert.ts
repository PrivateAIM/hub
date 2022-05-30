/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { CommandModule } from 'yargs';
import { DataSource } from 'typeorm';
import { createConfig } from '../../config';
import env from '../../env';
import { buildDataSourceOptions } from '../../database/utils';

export class MigrationRevertCommand implements CommandModule {
    command = 'migration:revert';

    describe = 'Revert database migration.';

    async handler(args: any) {
        createConfig({ env });

        const options = await buildDataSourceOptions();
        Object.assign(options, {
            logging: 'all',
        });

        const dataSource = new DataSource(options);
        await dataSource.initialize();

        try {
            await dataSource.undoLastMigration();
            // eslint-disable-next-line no-useless-catch
        } finally {
            await dataSource.destroy();
        }

        process.exit(0);
    }
}
