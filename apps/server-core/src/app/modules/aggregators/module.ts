/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import {
    QueueWorkerComponentCaller,
} from '@privateaim/server-kit';
import {
    AnalysisBuilderEventQueueRouterRouting,
    AnalysisDistributorEventQueueRouterRouting,
    MasterImageBuilderEventQueueRouterRouting,
    MasterImageSynchronizerEventQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import {
    BucketEventQueueRouterRouting,
    BucketFileEventQueueRouterRouting,
} from '@privateaim/server-storage-kit';
import {
    AnalysisBuilderAggregator,
    AnalysisDistributorAggregator,
    MasterImageBuilderAggregator,
    MasterImageSynchronizerAggregator,
    StorageBucketAggregator,
    StorageBucketFileAggregator,
    createAuthupAggregator,
} from '../../aggregators/index.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { ComponentsInjectionKey } from '../components/constants.ts';

export class AggregatorsModule implements IModule {
    readonly name = 'aggregators';

    readonly dependencies: string[] = ['database', 'components'];

    async setup(container: IContainer): Promise<void> {
        const dataSource = container.resolve(DatabaseInjectionKey.DataSource);
        const taskManager = container.resolve(ComponentsInjectionKey.TaskManager);
        const registryComponentCaller = container.resolve(ComponentsInjectionKey.RegistryComponentCaller);

        const aggregators = [
            createAuthupAggregator({ registryComponentCaller }),
            new QueueWorkerComponentCaller(
                new AnalysisBuilderAggregator({ dataSource }),
                { consumeQueue: AnalysisBuilderEventQueueRouterRouting },
            ),
            new QueueWorkerComponentCaller(
                new AnalysisDistributorAggregator({ dataSource }),
                { consumeQueue: AnalysisDistributorEventQueueRouterRouting },
            ),
            new QueueWorkerComponentCaller(
                new StorageBucketAggregator({ dataSource, taskManager }),
                { consumeQueue: BucketEventQueueRouterRouting },
            ),
            new QueueWorkerComponentCaller(
                new StorageBucketFileAggregator({ dataSource, taskManager }),
                { consumeQueue: BucketFileEventQueueRouterRouting },
            ),
            new QueueWorkerComponentCaller(
                new MasterImageBuilderAggregator({ dataSource }),
                { consumeQueue: MasterImageBuilderEventQueueRouterRouting },
            ),
            new QueueWorkerComponentCaller(
                new MasterImageSynchronizerAggregator({ dataSource }),
                { consumeQueue: MasterImageSynchronizerEventQueueRouterRouting },
            ),
        ];

        aggregators.forEach((a) => a.start());
    }
}
