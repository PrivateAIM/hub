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
    MessageBusInjectionKey,
    MessageBusWorkerComponentCaller,
    RedisSubscribeClientInjectionKey,
} from '@privateaim/server-kit';
import { EventComponentCaller } from '@privateaim/server-telemetry-kit';
import {
    AnalysisBuilderEventMessageBusRouting,
    AnalysisDistributorEventMessageBusRouting,
    MasterImageBuilderEventMessageBusRouting,
    MasterImageSynchronizerEventMessageBusRouting,
} from '@privateaim/server-core-worker-kit';
import {
    BucketEventMessageBusRouting,
    BucketFileEventMessageBusRouting,
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
        const messageBusResult = container.tryResolve(MessageBusInjectionKey);
        const messageBus = messageBusResult.success ? messageBusResult.data : undefined;
        const redisSubResult = container.tryResolve(RedisSubscribeClientInjectionKey);

        const aggregators = [
            createAuthupAggregator({
                registryComponentCaller,
                redisSubscribeClient: redisSubResult.success ? redisSubResult.data : undefined,
                logger,
            }),
            new MessageBusWorkerComponentCaller(
                new AnalysisBuilderAggregator({ dataSource }),
                {
                    consumeRouting: AnalysisBuilderEventMessageBusRouting,
                    messageBus,
                    logger,
                },
            ),
            new MessageBusWorkerComponentCaller(
                new AnalysisDistributorAggregator({ dataSource }),
                {
                    consumeRouting: AnalysisDistributorEventMessageBusRouting,
                    messageBus,
                    logger,
                },
            ),
            new MessageBusWorkerComponentCaller(
                new StorageBucketAggregator({
                    dataSource,
                    taskManager,
                    logger,
                }),
                {
                    consumeRouting: BucketEventMessageBusRouting,
                    messageBus,
                    logger,
                },
            ),
            new MessageBusWorkerComponentCaller(
                new StorageBucketFileAggregator({
                    dataSource,
                    taskManager,
                    logger,
                }),
                {
                    consumeRouting: BucketFileEventMessageBusRouting,
                    messageBus,
                    logger,
                },
            ),
            new MessageBusWorkerComponentCaller(
                new MasterImageBuilderAggregator({
                    dataSource,
                    eventComponentCaller: messageBus ? new EventComponentCaller({ messageBus }) : undefined,
                }),
                {
                    consumeRouting: MasterImageBuilderEventMessageBusRouting,
                    messageBus,
                    logger,
                },
            ),
            new MessageBusWorkerComponentCaller(
                new MasterImageSynchronizerAggregator({
                    imageRepository: container.resolve(DatabaseInjectionKey.MasterImageRepository),
                    groupRepository: container.resolve(DatabaseInjectionKey.MasterImageGroupRepository),
                    logger,
                    eventComponentCaller: messageBus ? new EventComponentCaller({ messageBus }) : undefined,
                }),
                {
                    consumeRouting: MasterImageSynchronizerEventMessageBusRouting,
                    messageBus,
                    logger,
                },
            ),
        ];

        aggregators.forEach((a) => a.start());
    }
}
