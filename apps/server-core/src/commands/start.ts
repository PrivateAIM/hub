/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { generateSwagger } from '@privateaim/server-http-kit';
import { useLogger } from '@privateaim/server-kit';
import path from 'node:path';
import { createApplication } from '../app/index.ts';
import { DatabaseInjectionKey } from '../app/modules/database/index.ts';
import { HTTPInjectionKey } from '../app/modules/http/index.ts';
import { createSocketServer } from '../socket/index.ts';
import {
    createConfig,
    getRootDirPath,
    getWritableDirPath,
    useEnv,
} from '../config/index.ts';
import { setupAuthupService, setupHarborService } from '../core/index.ts';
import { DatabaseIntegrityService } from '../services/index.ts';

export async function startCommand() {
    const app = createApplication();
    await app.setup();

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

    // DataSource is created and registered by DatabaseModule
    const dataSource = app.container.resolve(DatabaseInjectionKey.DataSource);

    logger.debug(`Database: ${dataSource.options.type}`);

    const databaseIntegrity = new DatabaseIntegrityService(dataSource);
    await databaseIntegrity.check();

    logger.debug('Executing authup service setup...');
    await setupAuthupService();
    logger.debug('Executed authup service setup.');

    logger.debug('Executing harbor service setup...');
    await setupHarborService();
    logger.debug('Executed harbor service setup.');

    // HTTP server is created and registered by HTTPModule
    const httpServer = app.container.resolve(HTTPInjectionKey.Server);

    createSocketServer(httpServer);

    const config = createConfig();
    config.components.forEach((c) => c.start());
    config.aggregators.forEach((a) => a.start());

    httpServer.listen(useEnv('port'), '0.0.0.0', () => {
        logger.debug(`Listening on port ${useEnv('port')}.`);
    });
}
