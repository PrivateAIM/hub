/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
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
import { RegistryComponent } from '../../components/registry/module.ts';
import { RegistryComponentCaller } from '../../components/registry/caller/module.ts';
import { RegistryTaskMessageBusRouting } from '../../components/registry/constants.ts';
import { ComponentsInjectionKey } from './constants.ts';

export class ComponentsModule implements IModule {
    readonly name = 'components';

    readonly dependencies: string[] = ['database'];

    async setup(container: IContainer): Promise<void> {
        // Create TaskManager
        const cache = container.resolve(CacheInjectionKey);
        const taskManager = new TaskManager<TaskMap>(cache);
        container.register(ComponentsInjectionKey.TaskManager, { useValue: taskManager });

        // Create components
        const config = container.resolve(ConfigInjectionKey);
        const authupResult = container.tryResolve(AuthupClientInjectionKey);
        const registryComponent = new RegistryComponent({
            publicURL: config.publicURL,
            authupClient: authupResult.success ? authupResult.data : undefined,
        });

        const logger = container.resolve(LoggerInjectionKey);
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
    }
}
