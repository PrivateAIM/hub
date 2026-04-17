/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IModule } from 'orkos';
import type { Component } from '@privateaim/server-kit';
import { QueueWorkerComponentCaller } from '@privateaim/server-kit';
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
import {
    AnalysisBuilderComponent,
    AnalysisDistributorComponent,
    MasterImageBuilderComponent,
    MasterImageSynchronizerComponent,
} from '../../components/index.ts';

export class ComponentsModule implements IModule {
    readonly name = 'components';

    readonly dependencies: string[] = [];

    async setup(): Promise<void> {
        const components: Component<any>[] = [
            new QueueWorkerComponentCaller(
                new AnalysisBuilderComponent(),
                {
                    publishQueue: AnalysisBuilderEventQueueRouterRouting,
                    consumeQueue: AnalysisBuilderTaskQueueRouterRouting,
                },
            ),
            new QueueWorkerComponentCaller(
                new AnalysisDistributorComponent(),
                {
                    publishQueue: AnalysisDistributorEventQueueRouterRouting,
                    consumeQueue: AnalysisDistributorTaskQueueRouterRouting,
                },
            ),
            new QueueWorkerComponentCaller(
                new MasterImageBuilderComponent(),
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
