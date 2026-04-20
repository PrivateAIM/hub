/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { AnalysisBuilderComponentCaller, AnalysisDistributorComponentCaller } from '@privateaim/server-core-worker-kit';
import { BucketComponentCaller } from '@privateaim/server-storage-kit';
import { MessageBusInjectionKey } from '@privateaim/server-kit';
import { AnalysisBuilder } from '../../../core/services/analysis-builder/index.ts';
import { AnalysisConfigurator } from '../../../core/services/analysis-configurator/index.ts';
import { AnalysisDistributor } from '../../../core/services/analysis-distributor/index.ts';
import { AnalysisStorageManager } from '../../../core/services/analysis-storage-manager/index.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { ComponentsInjectionKey } from '../components/constants.ts';
import { AnalysisInjectionKey } from './constants.ts';

export class AnalysisModule implements IModule {
    readonly name = 'analysis';

    readonly dependencies: string[] = ['database', 'components'];

    async setup(container: IContainer): Promise<void> {
        const analysisRepository = container.resolve(DatabaseInjectionKey.AnalysisRepository);
        const analysisNodeRepository = container.resolve(DatabaseInjectionKey.AnalysisNodeRepository);
        const analysisBucketRepository = container.resolve(DatabaseInjectionKey.AnalysisBucketRepository);
        const registryRepository = container.resolve(DatabaseInjectionKey.RegistryRepository);

        const metadataCaller = container.resolve(ComponentsInjectionKey.AnalysisMetadataComponentCaller);

        const messageBusResult = container.tryResolve(MessageBusInjectionKey);
        const messageBus = messageBusResult.success ? messageBusResult.data : undefined;

        container.register(AnalysisInjectionKey.Builder, {
            useValue: new AnalysisBuilder({
                repository: analysisRepository,
                caller: new AnalysisBuilderComponentCaller({ messageBus }),
                metadataCaller,
            }),
        });

        container.register(AnalysisInjectionKey.Configurator, {
            useValue: new AnalysisConfigurator({
                repository: analysisRepository,
                analysisNodeRepository,
                metadataCaller,
            }),
        });

        container.register(AnalysisInjectionKey.Distributor, {
            useValue: new AnalysisDistributor({
                repository: analysisRepository,
                analysisNodeRepository,
                registryRepository,
                caller: new AnalysisDistributorComponentCaller({ messageBus }),
                metadataCaller,
            }),
        });

        const storageManager = new AnalysisStorageManager({
            repository: analysisRepository,
            bucketRepository: analysisBucketRepository,
            caller: new BucketComponentCaller({ messageBus }),
            taskManager: container.resolve(ComponentsInjectionKey.TaskManager),
        });

        container.register(AnalysisInjectionKey.StorageManager, { useValue: storageManager });

        // Inject storageManager into the AnalysisSubscriber (created earlier by DatabaseModule)
        const subscriberResult = container.tryResolve(DatabaseInjectionKey.AnalysisSubscriber);
        if (subscriberResult.success) {
            subscriberResult.data.setStorageManager(storageManager);
        }
    }
}
