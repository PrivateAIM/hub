/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { generateSwagger } from '@privateaim/server-http-kit';
import { useLogger } from '@privateaim/server-kit';
import path from 'node:path';
import { DataSource } from 'typeorm';
import {
    checkDatabase, createDatabase, setDataSource, synchronizeDatabaseSchema,
} from 'typeorm-extension';
import { createSocketServer } from '../socket/index.ts';
import {
    createConfig, getRootDirPath, getWritableDirPath, useEnv,
} from '../config/index.ts';
import { setupAuthupService, setupHarborService } from '../core/index.ts';
import { buildDataSourceOptions, setDataSourceSync } from '../database/index.ts';
import { createRouter } from '../http/router.ts';
import { createHttpServer } from '../http/server.ts';
import { DatabaseIntegrityService } from '../services/index.ts';

export async function startCommand() {
    const config = createConfig();

    const logger = useLogger();

    logger.debug(`Environment: ${useEnv('env')}`);
    logger.debug(`WritableDirectoryPath: ${getWritableDirPath()}`);
    logger.debug(`Port: ${useEnv('port')}`);
    logger.debug(`Public-URL: ${useEnv('publicURL')}`);
    logger.debug(`Authup-URL: ${useEnv('authupURL')}`);
    logger.debug(`Docs-URL: ${new URL('docs/', useEnv('publicURL')).href}`);

    logger.debug('Generating documentation...');

    await generateSwagger({
        authupURL: useEnv('authupURL'),
        baseURL: useEnv('publicURL'),
        cwd: getRootDirPath(),
        controllerBasePath: path.join(getRootDirPath(), 'src', 'http', 'controllers'),
    });

    logger.debug('Generated documentation.');

    const options = await buildDataSourceOptions();

    logger.debug(`Database: ${options.type}`);

    const check = await checkDatabase({
        options,
        dataSourceCleanup: true,
    });

    if (!check.exists) {
        await createDatabase({ options, synchronize: false, ifNotExist: true });
    }

    logger.debug('Establishing database connection...');

    const dataSource = new DataSource(options);
    await dataSource.initialize();

    setDataSource(dataSource);
    setDataSourceSync(dataSource);

    logger.debug('Established database connection.');

    // if (!check.schema) {
    logger.debug('Applying database schema...');

    await synchronizeDatabaseSchema(dataSource);

    logger.debug('Applied database schema.');
    // }

    const databaseIntegrity = new DatabaseIntegrityService(dataSource);
    await databaseIntegrity.check();

    // if (!check.schema) {
    logger.debug('Executing authup service setup...');
    await setupAuthupService();
    logger.debug('Executed authup service setup.');
    // }

    logger.debug('Executing harbor service setup...');
    await setupHarborService();
    logger.debug('Executed harbor service setup.');

    const router = createRouter();
    const httpServer = createHttpServer({ router });

    createSocketServer(httpServer);

    config.components.forEach((c) => c.start());
    config.aggregators.forEach((a) => a.start());

    httpServer.listen(useEnv('port'), '0.0.0.0', () => {
        logger.debug(`Listening on port ${useEnv('port')}.`);
    });
}
