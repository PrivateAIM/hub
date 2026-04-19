/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import {
    LoggerInjectionKey,
    QueueRouterInjectionKey,
    QueueWorkerComponentCaller,
    RedisSubscribeClientInjectionKey,
} from '@privateaim/server-kit';
import { EventComponentCaller } from '@privateaim/server-telemetry-kit';
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
        const logger = container.resolve(LoggerInjectionKey);
        const queueRouterResult = container.tryResolve(QueueRouterInjectionKey);
        const queueRouter = queueRouterResult.success ? queueRouterResult.data : undefined;
        const redisSubResult = container.tryResolve(RedisSubscribeClientInjectionKey);

        const aggregators = [
            createAuthupAggregator({
                registryComponentCaller,
                redisSubscribeClient: redisSubResult.success ? redisSubResult.data : undefined,
                logger,
            }),
            new QueueWorkerComponentCaller(
                new AnalysisBuilderAggregator({ dataSource }),
                {
                    consumeQueue: AnalysisBuilderEventQueueRouterRouting, 
                    queueRouter, 
                    logger, 
                },
            ),
            new QueueWorkerComponentCaller(
                new AnalysisDistributorAggregator({ dataSource }),
                {
                    consumeQueue: AnalysisDistributorEventQueueRouterRouting, 
                    queueRouter, 
                    logger, 
                },
            ),
            new QueueWorkerComponentCaller(
                new StorageBucketAggregator({
                    dataSource, 
                    taskManager, 
                    logger, 
                }),
                {
                    consumeQueue: BucketEventQueueRouterRouting, 
                    queueRouter, 
                    logger, 
                },
            ),
            new QueueWorkerComponentCaller(
                new StorageBucketFileAggregator({
                    dataSource, 
                    taskManager, 
                    logger, 
                }),
                {
                    consumeQueue: BucketFileEventQueueRouterRouting, 
                    queueRouter, 
                    logger, 
                },
            ),
            new QueueWorkerComponentCaller(
                new MasterImageBuilderAggregator({
                    dataSource,
                    eventComponentCaller: queueRouter ? new EventComponentCaller({ queueRouter }) : undefined,
                }),
                {
                    consumeQueue: MasterImageBuilderEventQueueRouterRouting, 
                    queueRouter, 
                    logger, 
                },
            ),
            new QueueWorkerComponentCaller(
                new MasterImageSynchronizerAggregator({
                    dataSource,
                    logger,
                    eventComponentCaller: queueRouter ? new EventComponentCaller({ queueRouter }) : undefined,
                }),
                {
                    consumeQueue: MasterImageSynchronizerEventQueueRouterRouting, 
                    queueRouter, 
                    logger, 
                },
            ),
        ];

        aggregators.forEach((a) => a.start());
    }
}
