/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { withDataSourceLock } from '@privateaim/server-db-kit';
import {
    AuthupClientInjectionKey,
    CacheInjectionKey,
    LoggerInjectionKey,
    MessageBusInjectionKey,
    MessageBusWorkerComponentCaller,
    TaskManager,
} from '@privateaim/server-kit';
import { ConfigInjectionKey } from '../config/constants.ts';
import type { TaskMap } from '../../../core/domains/index.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { NodeClientService } from '../database/node-client.ts';
import { NODE_CLIENT_SYNC_DATABASE_LOCK } from '../../components/node-client/constants.ts';
import { createNodeClientComponent } from '../../components/node-client/module.ts';
import type { NodeClientComponent } from '../../components/node-client/types.ts';
import { RegistryComponent } from '../../components/registry/module.ts';
import { RegistryComponentCaller } from '../../components/registry/caller/module.ts';
import { RegistryTaskMessageBusRouting } from '../../components/registry/constants.ts';
import { ComponentsInjectionKey } from './constants.ts';

export class ComponentsModule implements IModule {
    readonly name = 'components';

    readonly dependencies: string[] = ['database'];

    protected backgroundComponents: NodeClientComponent[] = [];

    async setup(container: IContainer): Promise<void> {
        // Create TaskManager
        const cache = container.resolve(CacheInjectionKey);
        const taskManager = new TaskManager<TaskMap>(cache);
        container.register(ComponentsInjectionKey.TaskManager, { useValue: taskManager });

        // Create components
        const config = container.resolve(ConfigInjectionKey);
        const authupResult = container.tryResolve(AuthupClientInjectionKey);
        const logger = container.resolve(LoggerInjectionKey);
        const registryComponent = new RegistryComponent({
            publicURL: config.publicURL,
            authupClient: authupResult.success ? authupResult.data : undefined,
            logger,
        });

        const messageBusResult = container.tryResolve(MessageBusInjectionKey);
        const messageBus = messageBusResult.success ? messageBusResult.data : undefined;

        // Create and register component callers
        const registryComponentCaller = new RegistryComponentCaller(registryComponent, { messageBus });
        container.register(ComponentsInjectionKey.RegistryComponentCaller, { useValue: registryComponentCaller });

        // Start task consumers
        const components = [
            new MessageBusWorkerComponentCaller(
                registryComponent,
                {
                    consumeRouting: RegistryTaskMessageBusRouting,
                    messageBus,
                    logger,
                },
            ),
        ];

        components.forEach((c) => c.start());

        // Background components without a queue: without an Authup client
        // there are no node clients to sync.
        if (authupResult.success) {
            const dataSource = container.resolve(DatabaseInjectionKey.DataSource);
            this.backgroundComponents.push(createNodeClientComponent({
                lock: (fn) => withDataSourceLock(dataSource, NODE_CLIENT_SYNC_DATABASE_LOCK, fn),
                repository: container.resolve(DatabaseInjectionKey.NodeRepository),
                nodeClientService: new NodeClientService(authupResult.data),
                logger,
            }));
        }

        // start() is fire-and-forget, so it must not hold up boot, and a
        // rejection must be caught here: an unhandled one is fatal.
        this.backgroundComponents.forEach((component) => {
            component.start().catch((e) => {
                logger.error(`Starting a background component failed: ${e instanceof Error ? e.message : String(e)}`);
            });
        });
    }

    async teardown(): Promise<void> {
        const components = this.backgroundComponents;
        this.backgroundComponents = [];

        await Promise.all(components.map((component) => component.stop()));
    }
}
