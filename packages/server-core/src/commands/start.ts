/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createSocketServer } from '@privateaim/server-core-realtime';
import { generateSwagger } from '@privateaim/server-http-kit';
import { useLogger } from '@privateaim/server-kit';
import path from 'node:path';
import { DataSource } from 'typeorm';
import {
    checkDatabase, createDatabase, setDataSource, synchronizeDatabaseSchema,
} from 'typeorm-extension';
import {
    createConfig, getRootDirPath, getWritableDirPath, useEnv,
} from '../config';
import { setupAuthupService, setupHarborService } from '../core';
import { buildDataSourceOptions } from '../database';
import { createRouter } from '../http/router';
import { createHttpServer } from '../http/server';
import { DatabaseIntegrityService } from '../services';

export async function startCommand() {
    const config = createConfig();

    const logger = useLogger();

    logger.info(`Environment: ${useEnv('env')}`);
    logger.info(`WritableDirectoryPath: ${getWritableDirPath()}`);
    logger.info(`Port: ${useEnv('port')}`);
    logger.info(`Public-URL: ${useEnv('publicURL')}`);
    logger.info(`Authup-URL: ${useEnv('authupURL')}`);
    logger.info(`Docs-URL: ${new URL('docs/', useEnv('publicURL')).href}`);

    logger.info('Generating documentation...');

    await generateSwagger({
        authupURL: useEnv('authupURL'),
        baseURL: useEnv('publicURL'),
        cwd: getRootDirPath(),
        controllerBasePath: path.join(getRootDirPath(), 'src', 'http', 'controllers'),
    });

    logger.info('Generated documentation.');

    const options = await buildDataSourceOptions();

    logger.info(`Database: ${options.type}`);

    const check = await checkDatabase({
        options,
        dataSourceCleanup: true,
    });

    if (!check.exists) {
        await createDatabase({ options, synchronize: false, ifNotExist: true });
    }

    logger.info('Establishing database connection...');

    const dataSource = new DataSource(options);
    await dataSource.initialize();

    setDataSource(dataSource);

    logger.info('Established database connection.');

    if (!check.schema) {
        logger.info('Applying database schema...');

        await synchronizeDatabaseSchema(dataSource);

        logger.info('Applied database schema.');
    }

    const databaseIntegrity = new DatabaseIntegrityService(dataSource);
    await databaseIntegrity.check();

    // if (!check.schema) {
    logger.info('Executing authup service setup...');
    await setupAuthupService();
    logger.info('Executed authup service setup.');
    // }

    logger.info('Executing harbor service setup...');
    await setupHarborService();
    logger.info('Executed harbor service setup.');

    const router = createRouter();
    const httpServer = createHttpServer({ router });

    const socketServer = createSocketServer(httpServer, {
        authupURL: useEnv('authupURL'),
    });

    config.components.forEach((c) => c.start());
    config.aggregators.forEach((a) => a.start());

    httpServer.listen(useEnv('port'), '0.0.0.0', () => {
        logger.info('Started http server.');
        logger.info(`Socket.io server mounted on path: ${socketServer.path()}`);
    });
}
