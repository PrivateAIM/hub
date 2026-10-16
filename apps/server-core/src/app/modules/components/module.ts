/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { withDataSourceLock } from '@privateaim/server-db-kit';
import type { IComponent } from 'synergos';
import {
    AuthupClientInjectionKey,
    LoggerInjectionKey,
    MESSAGE_BUS_MODULE_NAME,
    MessageBusInjectionKey,
    createDispatchCallerLogHooks,
    createWorkerCallerLogHooks,
} from '@privateaim/server-kit';
import { WorkerCaller } from 'synergos';
import { AnalysisReconciler } from '../../../core/services/analysis-reconciler/index.ts';
import { createAnalysisReconcilerComponent } from '../../components/analysis-reconciler/module.ts';
import { AnalysisInjectionKey } from '../analysis/constants.ts';
import { ConfigInjectionKey } from '../config/constants.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { NodeClientService } from '../database/node-client.ts';
import { NODE_CLIENT_SYNC_DATABASE_LOCK } from '../../components/node-client/constants.ts';
import { createNodeClientComponent } from '../../components/node-client/module.ts';
import { RegistryComponent } from '../../components/registry/module.ts';
import { RegistryComponentCaller } from '../../components/registry/caller/module.ts';
import { RegistryTaskMessageBusRouting } from '../../components/registry/constants.ts';
import { ComponentsInjectionKey } from './constants.ts';

export class ComponentsModule implements IModule {
    readonly name = 'components';

    readonly dependencies: string[] = ['database', 'analysis', MESSAGE_BUS_MODULE_NAME];

    protected components: IComponent[] = [];

    protected starting: Promise<unknown> | undefined;

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

        // Create and register component callers
        const registryComponentCaller = new RegistryComponentCaller({
            messageBus,
            hooks: createDispatchCallerLogHooks(logger),
        });
        container.register(ComponentsInjectionKey.RegistryComponentCaller, { useValue: registryComponentCaller });

        // Start task consumers and background components
        this.components = [
            new WorkerCaller(
                registryComponent,
                {
                    consumeRouting: RegistryTaskMessageBusRouting,
                    messageBus,
                    hooks: createWorkerCallerLogHooks(logger),
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

        // Fire-and-forget: a background component's first pass must not
        // block boot. teardown() awaits it before stopping.
        this.starting = Promise.allSettled(this.components.map((c) => c.start()));
    }

    async teardown(): Promise<void> {
        const { components, starting } = this;
        this.components = [];
        this.starting = undefined;

        // A worker caller that is still starting would subscribe after its stop().
        await starting;
        await Promise.all(components.map((c) => c.stop()));
    }
}
