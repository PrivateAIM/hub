/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import type { Component } from '@privateaim/server-kit';
import { QueueRouterInjectionKey, QueueWorkerComponentCaller } from '@privateaim/server-kit';
import {
    AnalysisBuilderEventQueueRouterRouting,
    AnalysisBuilderTaskQueueRouterRouting,
    AnalysisDistributorEventQueueRouterRouting,
    AnalysisDistributorTaskQueueRouterRouting,
    MasterImageBuilderEventQueueRouterRouting,
    MasterImageBuilderTaskQueueRouterRouting,
    MasterImageSynchronizerEventQueueRouterRouting,
    MasterImageSynchronizerTaskQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import { CoreClientInjectionKey } from '../core-client/constants.ts';
import { StorageClientInjectionKey } from '../storage-client/constants.ts';
import { DockerInjectionKey } from '../docker/constants.ts';
import {
    AnalysisBuilderComponent,
    AnalysisDistributorComponent,
    MasterImageBuilderComponent,
    MasterImageSynchronizerComponent,
} from '../../components/index.ts';
import { createAnalysisBuilderLogger } from '../../components/analysis-builder/utils/logger.ts';
import { createAnalysisDistributorLogger } from '../../components/analysis-distributor/helpers/logger.ts';
import { createMasterImageBuilderLogger } from '../../components/master-image-builder/utils/logger.ts';

export class ComponentsModule implements IModule {
    readonly name = 'components';

    readonly dependencies: string[] = ['coreClient', 'storageClient', 'docker'];

    async setup(container: IContainer): Promise<void> {
        const coreClient = container.resolve(CoreClientInjectionKey);
        const storageClient = container.resolve(StorageClientInjectionKey);
        const docker = container.resolve(DockerInjectionKey);

        // Initialize component loggers with queueRouter (if available)
        const queueRouterResult = container.tryResolve(QueueRouterInjectionKey);
        const queueRouter = queueRouterResult.success ? queueRouterResult.data : undefined;
        createAnalysisBuilderLogger(queueRouter);
        createAnalysisDistributorLogger(queueRouter);
        createMasterImageBuilderLogger(queueRouter);

        const components: Component<any>[] = [
            new QueueWorkerComponentCaller(
                new AnalysisBuilderComponent({
                    coreClient, 
                    storageClient, 
                    docker, 
                }),
                {
                    publishQueue: AnalysisBuilderEventQueueRouterRouting,
                    consumeQueue: AnalysisBuilderTaskQueueRouterRouting,
                },
            ),
            new QueueWorkerComponentCaller(
                new AnalysisDistributorComponent({ coreClient, docker }),
                {
                    publishQueue: AnalysisDistributorEventQueueRouterRouting,
                    consumeQueue: AnalysisDistributorTaskQueueRouterRouting,
                },
            ),
            new QueueWorkerComponentCaller(
                new MasterImageBuilderComponent({ coreClient, docker }),
                {
                    publishQueue: MasterImageBuilderEventQueueRouterRouting,
                    consumeQueue: MasterImageBuilderTaskQueueRouterRouting,
                },
            ),
            new QueueWorkerComponentCaller(
                new MasterImageSynchronizerComponent(),
                {
                    publishQueue: MasterImageSynchronizerEventQueueRouterRouting,
                    consumeQueue: MasterImageSynchronizerTaskQueueRouterRouting,
                },
            ),
        ];

        const promises = components.map((c) => c.start());
        await Promise.all(promises);
    }
}
