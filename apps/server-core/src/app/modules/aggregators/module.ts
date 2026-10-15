/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import {
    ConfigInjectionKey,
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
    BucketFileTaskCaller,
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
import { AnalysisBucketFileService } from '../../../core/index.ts';
import { MasterImageBuilderService } from '../../../core/services/index.ts';
import { AnalysisInjectionKey } from '../analysis/constants.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { ComponentsInjectionKey } from '../components/constants.ts';

export class AggregatorsModule implements IModule {
    readonly name = 'aggregators';

    readonly dependencies: string[] = ['database', 'components', 'analysis'];

    async setup(container: IContainer): Promise<void> {
        const analysisRepository = container.resolve(DatabaseInjectionKey.AnalysisRepository);
        const analysisBucketRepository = container.resolve(DatabaseInjectionKey.AnalysisBucketRepository);
        const analysisBucketFileRepository = container.resolve(DatabaseInjectionKey.AnalysisBucketFileRepository);
        const masterImageRepository = container.resolve(DatabaseInjectionKey.MasterImageRepository);
        const taskManager = container.resolve(ComponentsInjectionKey.TaskManager);
        const registryComponentCaller = container.resolve(ComponentsInjectionKey.RegistryComponentCaller);
        const logger = container.resolve(LoggerInjectionKey);
        const messageBusResult = container.tryResolve(MessageBusInjectionKey);
        const messageBus = messageBusResult.success ? messageBusResult.data : undefined;
        const redisSubResult = container.tryResolve(RedisSubscribeClientInjectionKey);

        const config = container.resolve(ConfigInjectionKey);

        const aggregators = [
            createAuthupAggregator({
                env: config.env,
                registryComponentCaller,
                analysisRepository,
                analysisBucketFileRepository,
                nodeRepository: container.resolve(DatabaseInjectionKey.NodeRepository),
                projectRepository: container.resolve(DatabaseInjectionKey.ProjectRepository),
                registryProjectRepository: container.resolve(DatabaseInjectionKey.RegistryProjectRepository),
                redisSubscribeClient: redisSubResult.success ? redisSubResult.data : undefined,
                logger,
            }),
            new MessageBusWorkerComponentCaller(
                new AnalysisBuilderAggregator({ builder: container.resolve(AnalysisInjectionKey.Builder) }),
                {
                    consumeRouting: AnalysisBuilderEventMessageBusRouting,
                    messageBus,
                    logger,
                },
            ),
            new MessageBusWorkerComponentCaller(
                new AnalysisDistributorAggregator({ distributor: container.resolve(AnalysisInjectionKey.Distributor) }),
                {
                    consumeRouting: AnalysisDistributorEventMessageBusRouting,
                    messageBus,
                    logger,
                },
            ),
            new MessageBusWorkerComponentCaller(
                new StorageBucketAggregator({
                    analysisRepository,
                    analysisBucketRepository,
                    analysisBucketFileRepository,
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
                    service: new AnalysisBucketFileService({
                        repository: analysisBucketFileRepository,
                        recalculator: container.resolve(AnalysisInjectionKey.FileRecalculator),
                        analysisRepository,
                        analysisBucketRepository,
                        analysisNodeRepository: container.resolve(DatabaseInjectionKey.AnalysisNodeRepository),
                    }),
                    logger,
                    bucketFileCaller: new BucketFileTaskCaller({ messageBus, logger }),
                }),
                {
                    consumeRouting: BucketFileEventMessageBusRouting,
                    messageBus,
                    logger,
                },
            ),
            new MessageBusWorkerComponentCaller(
                new MasterImageBuilderAggregator({
                    service: new MasterImageBuilderService({ imageRepository: masterImageRepository }),
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
                    imageRepository: masterImageRepository,
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
