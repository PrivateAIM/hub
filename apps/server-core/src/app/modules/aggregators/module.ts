/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import type { IComponent } from 'ergos';
import {
    ConfigInjectionKey,
    LoggerInjectionKey,
    MessageBusInjectionKey,
    RedisSubscribeClientInjectionKey,
} from '@privateaim/server-kit';
import { MessageBusWorkerComponentCaller } from 'ergos';
import { EventComponentCaller } from '@privateaim/server-telemetry-kit';
import {
    AnalysisBuilderEventMessageBusRouting,
    AnalysisDistributorEventMessageBusRouting,
    MasterImageBuilderEventMessageBusRouting,
    MasterImageSynchronizerEventMessageBusRouting,
} from '@privateaim/server-core-worker-kit';
import {
    BucketComponentCaller,
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
import { AnalysisReachService } from '../../../core/services/analysis-reach/index.ts';
import { MasterImageBuilderService } from '../../../core/services/index.ts';
import { AnalysisInjectionKey } from '../analysis/constants.ts';
import { DatabaseInjectionKey } from '../database/constants.ts';
import { ComponentsInjectionKey } from '../components/constants.ts';

export class AggregatorsModule implements IModule {
    readonly name = 'aggregators';

    readonly dependencies: string[] = ['database', 'components', 'analysis'];

    protected aggregators: IComponent<any>[] = [];

    protected starting: Promise<unknown> | undefined;

    async setup(container: IContainer): Promise<void> {
        const analysisRepository = container.resolve(DatabaseInjectionKey.AnalysisRepository);
        const analysisBucketRepository = container.resolve(DatabaseInjectionKey.AnalysisBucketRepository);
        const analysisBucketFileRepository = container.resolve(DatabaseInjectionKey.AnalysisBucketFileRepository);
        const masterImageRepository = container.resolve(DatabaseInjectionKey.MasterImageRepository);
        const registryComponentCaller = container.resolve(ComponentsInjectionKey.RegistryComponentCaller);
        const logger = container.resolve(LoggerInjectionKey);
        const messageBusResult = container.tryResolve(MessageBusInjectionKey);
        const messageBus = messageBusResult.success ? messageBusResult.data : undefined;
        const redisSubResult = container.tryResolve(RedisSubscribeClientInjectionKey);

        const config = container.resolve(ConfigInjectionKey);

        this.aggregators = [
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
                    bucketCaller: new BucketComponentCaller({ messageBus }),
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
                        reach: new AnalysisReachService({
                            analysisNodeRepository: container.resolve(DatabaseInjectionKey.AnalysisNodeRepository),
                            analysisRepository,
                            nodeRepository: container.resolve(DatabaseInjectionKey.NodeRepository),
                        }),
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

        this.starting = Promise.allSettled(this.aggregators.map((a) => a.start()));
    }

    async teardown(): Promise<void> {
        const { aggregators, starting } = this;
        this.aggregators = [];
        this.starting = undefined;

        await starting;
        await Promise.all(aggregators.map((a) => a.stop()));
    }
}
