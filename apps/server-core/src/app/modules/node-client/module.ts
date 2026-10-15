/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import { withDataSourceLock } from '@privateaim/server-db-kit';
import { AUTHUP_CLIENT_MODULE_NAME, AuthupClientInjectionKey, LoggerInjectionKey } from '@privateaim/server-kit';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { NodeClientService } from '../database/node-client.ts';
import { NODE_CLIENT_SYNC_DATABASE_LOCK } from './constants.ts';
import { syncNodeClientPermissions } from './sync.ts';

/**
 * Boot pass that brings every existing node client's Authup permissions up
 * to date (see syncNodeClientPermissions). Without an Authup client there is
 * nothing to sync, so it does nothing.
 */
export class NodeClientModule implements IModule {
    readonly name = 'nodeClient';

    readonly dependencies: (string | ModuleDependency)[] = [
        'database',
        { name: AUTHUP_CLIENT_MODULE_NAME, optional: true },
    ];

    async setup(container: IContainer): Promise<void> {
        const authupResult = container.tryResolve(AuthupClientInjectionKey);
        if (!authupResult.success) return;

        const loggerResult = container.tryResolve(LoggerInjectionKey);
        const logger = loggerResult.success ? loggerResult.data : undefined;

        const dataSource = container.resolve(DatabaseInjectionKey.DataSource);
        const repository = container.resolve(DatabaseInjectionKey.NodeRepository);
        const nodeClientService = new NodeClientService(authupResult.data);

        const { synced, failed } = await withDataSourceLock(
            dataSource,
            NODE_CLIENT_SYNC_DATABASE_LOCK,
            () => syncNodeClientPermissions({
                repository, 
                nodeClientService, 
                logger, 
            }),
        );

        if (failed > 0) {
            logger?.error(`Synced the permissions of ${synced} node clients, ${failed} failed.`);
        } else {
            logger?.debug(`Synced the permissions of ${synced} node clients.`);
        }
    }
}
