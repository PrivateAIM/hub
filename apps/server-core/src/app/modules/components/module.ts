/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import {
    Cache,
    QueueWorkerComponentCaller,
    TaskManager,
    createCacheAdapter,
} from '@privateaim/server-kit';
import type { TaskMap } from '../../../core/domains/index.ts';
import { AnalysisMetadataComponent } from '../../components/analysis-metadata/module.ts';
import { AnalysisMetadataComponentCaller } from '../../components/analysis-metadata/caller/module.ts';
import { AnalysisMetadataTaskQueue } from '../../components/analysis-metadata/constants.ts';
import { RegistryComponent } from '../../components/registry/module.ts';
import { RegistryComponentCaller } from '../../components/registry/caller/module.ts';
import { RegistryTaskQueueRouterRouting } from '../../components/registry/constants.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { ComponentsInjectionKey } from './constants.ts';

export class ComponentsModule implements IModule {
    readonly name = 'components';

    readonly dependencies: string[] = ['database'];

    async setup(container: IContainer): Promise<void> {
        const dataSource = container.resolve(DatabaseInjectionKey.DataSource);

        // Create TaskManager
        const cacheAdapter = createCacheAdapter();
        const cache = new Cache(cacheAdapter);
        const taskManager = new TaskManager<TaskMap>(cache);
        container.register(ComponentsInjectionKey.TaskManager, { useValue: taskManager });

        // Create components
        const registryComponent = new RegistryComponent();
        const analysisMetadataComponent = new AnalysisMetadataComponent({ dataSource });

        // Create and register component callers
        const registryComponentCaller = new RegistryComponentCaller(registryComponent);
        const analysisMetadataComponentCaller = new AnalysisMetadataComponentCaller(analysisMetadataComponent);
        container.register(ComponentsInjectionKey.RegistryComponentCaller, { useValue: registryComponentCaller });
        container.register(ComponentsInjectionKey.AnalysisMetadataComponentCaller, { useValue: analysisMetadataComponentCaller });

        // Inject metadataCaller into subscribers (created earlier by DatabaseModule)
        this.injectMetadataCaller(container, analysisMetadataComponentCaller);

        // Start task consumers
        const components = [
            new QueueWorkerComponentCaller(
                registryComponent,
                { consumeQueue: RegistryTaskQueueRouterRouting },
            ),
            new QueueWorkerComponentCaller(
                analysisMetadataComponent,
                { consumeQueue: AnalysisMetadataTaskQueue },
            ),
        ];

        components.forEach((c) => c.start());
    }

    private injectMetadataCaller(container: IContainer, metadataCaller: AnalysisMetadataComponentCaller): void {
        const analysisSubscriber = container.resolve(DatabaseInjectionKey.AnalysisSubscriber);
        analysisSubscriber.setMetadataCaller(metadataCaller);

        const bucketFileSubscriber = container.resolve(DatabaseInjectionKey.AnalysisBucketFileSubscriber);
        bucketFileSubscriber.setMetadataCaller(metadataCaller);

        const analysisNodeSubscriber = container.resolve(DatabaseInjectionKey.AnalysisNodeSubscriber);
        analysisNodeSubscriber.setMetadataCaller(metadataCaller);
    }
}
