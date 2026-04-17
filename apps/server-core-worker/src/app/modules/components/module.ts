/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import type { Component } from '@privateaim/server-kit';
import { 
    LoggerConsoleTransport, 
    QueueRouterInjectionKey, 
    QueueWorkerComponentCaller, 
    createLogger, 
} from '@privateaim/server-kit';
import {
    AnalysisBuilderEventQueueRouterRouting,
    AnalysisBuilderTaskQueueRouterRouting,
    AnalysisDistributorEventQueueRouterRouting,
    AnalysisDistributorTaskQueueRouterRouting,
    ComponentName,
    MasterImageBuilderEventQueueRouterRouting,
    MasterImageBuilderTaskQueueRouterRouting,
    MasterImageSynchronizerEventQueueRouterRouting, 
    MasterImageSynchronizerTaskQueueRouterRouting, 
} from '@privateaim/server-core-worker-kit';
import { DomainType } from '@privateaim/core-kit';
import { LogComponentCaller, LoggerTransport } from '@privateaim/server-telemetry-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { CoreClientInjectionKey } from '../core-client/constants.ts';
import { StorageClientInjectionKey } from '../storage-client/constants.ts';
import { DockerInjectionKey } from '../docker/constants.ts';
import {
    AnalysisBuilderComponent,
    AnalysisDistributorComponent,
    MasterImageBuilderComponent,
    MasterImageSynchronizerComponent,
} from '../../components/index.ts';

export class ComponentsModule implements IModule {
    readonly name = 'components';

    readonly dependencies: string[] = ['coreClient', 'storageClient', 'docker'];

    async setup(container: IContainer): Promise<void> {
        const coreClient = container.resolve(CoreClientInjectionKey);
        const storageClient = container.resolve(StorageClientInjectionKey);
        const docker = container.resolve(DockerInjectionKey);

        // Resolve queueRouter (if available) for log transport
        const queueRouterResult = container.tryResolve(QueueRouterInjectionKey);
        const queueRouter = queueRouterResult.success ? queueRouterResult.data : undefined;
        const logCaller = queueRouter ? new LogComponentCaller({ queueRouter }) : undefined;

        const analysisBuilderLogger = createLogger({
            options: { defaultMeta: { component: ComponentName.ANALYSIS_BUILDER } },
            transports: [
                new LoggerConsoleTransport(),
                new LoggerTransport({
                    labels: {
                        [LogFlag.SERVICE]: 'hub-server-worker',
                        [LogFlag.CHANNEL]: LogChannel.SYSTEM,
                        [LogFlag.COMPONENT]: ComponentName.ANALYSIS_BUILDER,
                        [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
                    },
                    save: async (data) => {
                        if (logCaller) {
                            await logCaller.callWrite(data);
                        }
                    },
                }),
            ],
        });

        const analysisDistributorLogger = createLogger({
            options: { defaultMeta: { component: ComponentName.ANALYSIS_DISTRIBUTOR } },
            transports: [
                new LoggerConsoleTransport(),
                new LoggerTransport({
                    labels: {
                        [LogFlag.SERVICE]: 'hub-server-worker',
                        [LogFlag.CHANNEL]: LogChannel.SYSTEM,
                        [LogFlag.COMPONENT]: ComponentName.ANALYSIS_DISTRIBUTOR,
                        [LogFlag.REF_TYPE]: DomainType.ANALYSIS,
                    },
                    save: async (data) => {
                        if (logCaller) {
                            await logCaller.callWrite(data);
                        }
                    },
                }),
            ],
        });

        const masterImageBuilderLogger = createLogger({
            options: { defaultMeta: { component: ComponentName.MASTER_IMAGE_BUILDER } },
            transports: [
                new LoggerConsoleTransport(),
                new LoggerTransport({
                    labels: {
                        [LogFlag.SERVICE]: 'hub-server-worker',
                        [LogFlag.CHANNEL]: LogChannel.SYSTEM,
                        [LogFlag.COMPONENT]: ComponentName.MASTER_IMAGE_BUILDER,
                        [LogFlag.REF_TYPE]: DomainType.MASTER_IMAGE,
                    },
                    save: async (data) => {
                        if (logCaller) {
                            await logCaller.callWrite(data);
                        }
                    },
                }),
            ],
        });

        const components: Component<any>[] = [
            new QueueWorkerComponentCaller(
                new AnalysisBuilderComponent({
                    coreClient,
                    storageClient,
                    docker,
                    logger: analysisBuilderLogger,
                }),
                {
                    publishQueue: AnalysisBuilderEventQueueRouterRouting,
                    consumeQueue: AnalysisBuilderTaskQueueRouterRouting,
                },
            ),
            new QueueWorkerComponentCaller(
                new AnalysisDistributorComponent({
                    coreClient, 
                    docker, 
                    logger: analysisDistributorLogger, 
                }),
                {
                    publishQueue: AnalysisDistributorEventQueueRouterRouting,
                    consumeQueue: AnalysisDistributorTaskQueueRouterRouting,
                },
            ),
            new QueueWorkerComponentCaller(
                new MasterImageBuilderComponent({
                    coreClient, 
                    docker, 
                    logger: masterImageBuilderLogger, 
                }),
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
