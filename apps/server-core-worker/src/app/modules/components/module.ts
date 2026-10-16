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
    LoggerConsoleTransport,
    MESSAGE_BUS_MODULE_NAME,
    MessageBusInjectionKey,
    RemoteMessageBusInjectionKey,
    createLogger,
    createRemoteWorkerLogHooks,
} from '@privateaim/server-kit';
import { RemoteWorker } from 'hubwire';
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
import { LogComponentDispatcher, LoggerTransport } from '@privateaim/server-telemetry-kit';
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
        // only over AMQP: server-telemetry consumes the log lines, nothing in-process does
        const remoteResult = container.tryResolve(RemoteMessageBusInjectionKey);
        const logDispatcher = remoteResult.success ?
            new LogComponentDispatcher({ messageBus: remoteResult.data }) :
            undefined;

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
                        await logDispatcher?.dispatchWrite(data);
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
                        await logDispatcher?.dispatchWrite(data);
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
                        await logDispatcher?.dispatchWrite(data);
                    },
                }),
            ],
        });

        this.components = [
            new RemoteWorker(
                new AnalysisBuilderComponent({
                    coreClient,
                    storageClient,
                    docker,
                    logger: analysisBuilderLogger,
                }),
                {
                    publish: AnalysisBuilderEventMessageBusRouting,
                    consume: AnalysisBuilderTaskMessageBusRouting,
                    messageBus,
                    hooks: createRemoteWorkerLogHooks(analysisBuilderLogger),
                },
            ),
            new RemoteWorker(
                new AnalysisDistributorComponent({
                    coreClient,
                    docker,
                    logger: analysisDistributorLogger,
                }),
                {
                    publish: AnalysisDistributorEventMessageBusRouting,
                    consume: AnalysisDistributorTaskMessageBusRouting,
                    messageBus,
                    hooks: createRemoteWorkerLogHooks(analysisDistributorLogger),
                },
            ),
            new RemoteWorker(
                new MasterImageBuilderComponent({
                    coreClient,
                    docker,
                    logger: masterImageBuilderLogger,
                }),
                {
                    publish: MasterImageBuilderEventMessageBusRouting,
                    consume: MasterImageBuilderTaskMessageBusRouting,
                    messageBus,
                    hooks: createRemoteWorkerLogHooks(masterImageBuilderLogger),
                },
            ),
            new RemoteWorker(
                new MasterImageSynchronizerComponent({ logger: masterImageBuilderLogger }),
                {
                    publish: MasterImageSynchronizerEventMessageBusRouting,
                    consume: MasterImageSynchronizerTaskMessageBusRouting,
                    messageBus,
                    hooks: createRemoteWorkerLogHooks(masterImageBuilderLogger),
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
