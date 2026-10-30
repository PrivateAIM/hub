/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { withDataSourceLock } from '@privateaim/server-db-kit';
import type { IComponent } from 'hubwire';
import {
    AuthupClientInjectionKey,
    LoggerInjectionKey,
    MESSAGE_BUS_MODULE_NAME,
    MessageBusInjectionKey,
    createRemoteWorkerLogHooks,
} from '@privateaim/server-kit';
import { RemoteWorker } from 'hubwire';
import { AnalysisReconciler } from '../../../core/services/analysis-reconciler/index.ts';
import { createAnalysisReconcilerComponent } from '../../components/analysis-reconciler/module.ts';
import { AnalysisInjectionKey } from '../analysis/constants.ts';
import { ConfigInjectionKey } from '../config/constants.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { NodeClientService } from '../database/node-client.ts';
import { NODE_CLIENT_SYNC_DATABASE_LOCK } from '../../components/node-client/constants.ts';
import { createNodeClientComponent } from '../../components/node-client/module.ts';
import { RegistryComponent } from '../../components/registry/module.ts';
import { RegistryComponentDispatcher } from '../../components/registry/dispatcher/module.ts';
import { RegistryTaskMessageBusRouting } from '../../components/registry/constants.ts';
import { startComponentsInBackground } from '../../components/start/module.ts';
import { ComponentsInjectionKey } from './constants.ts';

export class ComponentsModule implements IModule {
    readonly name = 'components';

    readonly dependencies: string[] = ['database', 'analysis', MESSAGE_BUS_MODULE_NAME];

    protected components: IComponent[] = [];

    async setup(container: IContainer): Promise<void> {
        // Create components
        const config = container.resolve(ConfigInjectionKey);
        const authupResult = container.tryResolve(AuthupClientInjectionKey);
        const logger = container.resolve(LoggerInjectionKey);
        const registryComponent = new RegistryComponent({
            publicURL: config.publicURL,
            authupClient: authupResult.success ? authupResult.data : undefined,
            logger,
        });

        const messageBus = container.resolve(MessageBusInjectionKey);

        // Create and register component dispatchers
        const registryComponentDispatcher = new RegistryComponentDispatcher(registryComponent, { messageBus });

        container.register(ComponentsInjectionKey.RegistryComponentDispatcher, { useValue: registryComponentDispatcher });

        // Start task consumers and background components
        this.components = [
            new RemoteWorker(
                registryComponent,
                {
                    consume: RegistryTaskMessageBusRouting,
                    messageBus,
                    hooks: createRemoteWorkerLogHooks(logger),
                },
            ),
        ];

        this.components.push(createAnalysisReconcilerComponent({
            reconciler: new AnalysisReconciler({
                repository: container.resolve(DatabaseInjectionKey.AnalysisRepository),
                builder: container.resolve(AnalysisInjectionKey.Builder),
                distributor: container.resolve(AnalysisInjectionKey.Distributor),
                logger,
            }),
            logger,
        }));

        // Without an Authup client there are no node clients to sync.
        if (authupResult.success) {
            const dataSource = container.resolve(DatabaseInjectionKey.DataSource);

            this.components.push(createNodeClientComponent({
                lock: (fn) => withDataSourceLock(dataSource, NODE_CLIENT_SYNC_DATABASE_LOCK, fn),
                repository: container.resolve(DatabaseInjectionKey.NodeRepository),
                nodeClientService: new NodeClientService(authupResult.data),
                logger,
            }));
        }


        // Fire-and-forget, but a failed start is logged: a background component's first pass must not
        // block boot. teardown() awaits it through settled().
        void startComponentsInBackground(this.components, logger);
    }

    async teardown(): Promise<void> {
        const { components } = this;

        this.components = [];

        await Promise.all(components.map((c) => c.stop()));
        // stop() never waits for a cron pass in flight; it must finish before the database closes.
        await Promise.all(components.map((c) => c.settled?.()));
    }
}
