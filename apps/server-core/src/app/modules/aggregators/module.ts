/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import type { IComponent } from 'hubwire';
import {
    ConfigInjectionKey,
    LoggerInjectionKey,
    MESSAGE_BUS_MODULE_NAME,
    MessageBusInjectionKey,
    RedisSubscribeClientInjectionKey,
    createRemoteWorkerLogHooks,
} from '@privateaim/server-kit';
import { RemoteWorker } from 'hubwire';
import { EventComponentDispatcher } from '@privateaim/server-telemetry-kit';
import {
    AnalysisBuilderEventMessageBusRouting,
    AnalysisDistributorEventMessageBusRouting,
    MasterImageBuilderEventMessageBusRouting,
    MasterImageSynchronizerEventMessageBusRouting,
} from '@privateaim/server-core-worker-kit';
import {
    BucketComponentDispatcher,
    BucketEventMessageBusRouting,
    BucketFileEventMessageBusRouting,
    BucketFileTaskDispatcher,
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

    readonly dependencies: string[] = ['database', 'components', 'analysis', MESSAGE_BUS_MODULE_NAME];

    protected aggregators: IComponent<any>[] = [];

    async setup(container: IContainer): Promise<void> {
        const analysisRepository = container.resolve(DatabaseInjectionKey.AnalysisRepository);
        const analysisBucketRepository = container.resolve(DatabaseInjectionKey.AnalysisBucketRepository);
        const analysisBucketFileRepository = container.resolve(DatabaseInjectionKey.AnalysisBucketFileRepository);
        const masterImageRepository = container.resolve(DatabaseInjectionKey.MasterImageRepository);
        const registryComponentDispatcher = container.resolve(ComponentsInjectionKey.RegistryComponentDispatcher);
        const logger = container.resolve(LoggerInjectionKey);
        const messageBus = container.resolve(MessageBusInjectionKey);
        const workerHooks = createRemoteWorkerLogHooks(logger);
        const redisSubResult = container.tryResolve(RedisSubscribeClientInjectionKey);

        const config = container.resolve(ConfigInjectionKey);

        this.aggregators = [
            createAuthupAggregator({
                env: config.env,
                registryComponentDispatcher,
                analysisRepository,
                analysisBucketFileRepository,
                nodeRepository: container.resolve(DatabaseInjectionKey.NodeRepository),
                projectRepository: container.resolve(DatabaseInjectionKey.ProjectRepository),
                registryProjectRepository: container.resolve(DatabaseInjectionKey.RegistryProjectRepository),
                redisSubscribeClient: redisSubResult.success ? redisSubResult.data : undefined,
                logger,
            }),
            new RemoteWorker(
                new AnalysisBuilderAggregator({ builder: container.resolve(AnalysisInjectionKey.Builder) }),
                {
                    consume: AnalysisBuilderEventMessageBusRouting,
                    messageBus,
                    hooks: workerHooks,
                },
            ),
            new RemoteWorker(
                new AnalysisDistributorAggregator({ distributor: container.resolve(AnalysisInjectionKey.Distributor) }),
                {
                    consume: AnalysisDistributorEventMessageBusRouting,
                    messageBus,
                    hooks: workerHooks,
                },
            ),
            new RemoteWorker(
                new StorageBucketAggregator({
                    analysisRepository,
                    analysisBucketRepository,
                    analysisBucketFileRepository,
                    bucketDispatcher: new BucketComponentDispatcher({ messageBus }),
                    logger,
                }),
                {
                    consume: BucketEventMessageBusRouting,
                    messageBus,
                    hooks: workerHooks,
                },
            ),
            new RemoteWorker(
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
                    bucketFileDispatcher: new BucketFileTaskDispatcher({ messageBus }),
                }),
                {
                    consume: BucketFileEventMessageBusRouting,
                    messageBus,
                    hooks: workerHooks,
                },
            ),
            new RemoteWorker(
                new MasterImageBuilderAggregator({
                    service: new MasterImageBuilderService({ imageRepository: masterImageRepository }),
                    eventComponentDispatcher: new EventComponentDispatcher({ messageBus }),
                }),
                {
                    consume: MasterImageBuilderEventMessageBusRouting,
                    messageBus,
                    hooks: workerHooks,
                },
            ),
            new RemoteWorker(
                new MasterImageSynchronizerAggregator({
                    imageRepository: masterImageRepository,
                    groupRepository: container.resolve(DatabaseInjectionKey.MasterImageGroupRepository),
                    logger,
                    eventComponentDispatcher: new EventComponentDispatcher({ messageBus }),
                }),
                {
                    consume: MasterImageSynchronizerEventMessageBusRouting,
                    messageBus,
                    hooks: workerHooks,
                },
            ),
        ];

        // Fire-and-forget: a stop() during a start() still leaves nothing subscribed.
        void Promise.allSettled(this.aggregators.map((a) => a.start()));
    }

    async teardown(): Promise<void> {
        const { aggregators } = this;
        this.aggregators = [];

        await Promise.all(aggregators.map((a) => a.stop()));
        await Promise.all(aggregators.map((a) => a.settled?.()));
    }
}
