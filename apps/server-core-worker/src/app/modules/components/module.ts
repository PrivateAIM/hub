/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import type { IComponent } from 'synergos';
import {
    LoggerConsoleTransport,
    MESSAGE_BUS_MODULE_NAME,
    MessageBusInjectionKey,
    createLogger,
    createWorkerCallerLogHooks,
} from '@privateaim/server-kit';
import { WorkerCaller } from 'synergos';
import {
    AnalysisBuilderEventMessageBusRouting,
    AnalysisBuilderTaskMessageBusRouting,
    AnalysisDistributorEventMessageBusRouting,
    AnalysisDistributorTaskMessageBusRouting,
    ComponentName,
    MasterImageBuilderEventMessageBusRouting,
    MasterImageBuilderTaskMessageBusRouting,
    MasterImageSynchronizerEventMessageBusRouting,
    MasterImageSynchronizerTaskMessageBusRouting,
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

    readonly dependencies: string[] = ['coreClient', 'storageClient', 'docker', MESSAGE_BUS_MODULE_NAME];

    protected components: IComponent<any>[] = [];

    async setup(container: IContainer): Promise<void> {
        const coreClient = container.resolve(CoreClientInjectionKey);
        const storageClient = container.resolve(StorageClientInjectionKey);
        const docker = container.resolve(DockerInjectionKey);

        const messageBus = container.resolve(MessageBusInjectionKey);
        const logCaller = new LogComponentCaller({ messageBus });

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
                        await logCaller.callWrite(data);
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
                        await logCaller.callWrite(data);
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
                        await logCaller.callWrite(data);
                    },
                }),
            ],
        });

        this.components = [
            new WorkerCaller(
                new AnalysisBuilderComponent({
                    coreClient,
                    storageClient,
                    docker,
                    logger: analysisBuilderLogger,
                }),
                {
                    publishRouting: AnalysisBuilderEventMessageBusRouting,
                    consumeRouting: AnalysisBuilderTaskMessageBusRouting,
                    messageBus,
                    hooks: createWorkerCallerLogHooks(analysisBuilderLogger),
                },
            ),
            new WorkerCaller(
                new AnalysisDistributorComponent({
                    coreClient,
                    docker,
                    logger: analysisDistributorLogger,
                }),
                {
                    publishRouting: AnalysisDistributorEventMessageBusRouting,
                    consumeRouting: AnalysisDistributorTaskMessageBusRouting,
                    messageBus,
                    hooks: createWorkerCallerLogHooks(analysisDistributorLogger),
                },
            ),
            new WorkerCaller(
                new MasterImageBuilderComponent({
                    coreClient,
                    docker,
                    logger: masterImageBuilderLogger,
                }),
                {
                    publishRouting: MasterImageBuilderEventMessageBusRouting,
                    consumeRouting: MasterImageBuilderTaskMessageBusRouting,
                    messageBus,
                    hooks: createWorkerCallerLogHooks(masterImageBuilderLogger),
                },
            ),
            new WorkerCaller(
                new MasterImageSynchronizerComponent({ logger: masterImageBuilderLogger }),
                {
                    publishRouting: MasterImageSynchronizerEventMessageBusRouting,
                    consumeRouting: MasterImageSynchronizerTaskMessageBusRouting,
                    messageBus,
                    hooks: createWorkerCallerLogHooks(masterImageBuilderLogger),
                },
            ),
        ];

        await Promise.all(this.components.map((c) => c.start()));
    }

    async teardown(): Promise<void> {
        const { components } = this;
        this.components = [];

        await Promise.all(components.map((c) => c.stop()));
    }
}
