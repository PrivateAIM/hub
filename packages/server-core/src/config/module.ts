/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Component } from '@privateaim/server-kit';
import { QueueWorkerComponentCaller } from '@privateaim/server-kit';
import {
    AnalysisBuilderEventQueueRouterRouting,
    AnalysisDistributorEventQueueRouterRouting,
    MasterImageBuilderEventQueueRouterRouting,
    MasterImageSynchronizerEventQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import { BucketEventQueueRouterRouting } from '@privateaim/server-storage-kit';
import { EventEventQueueRouterRouting } from '@privateaim/server-telemetry-kit';
import {
    AnalysisBuilderAggregator,
    AnalysisDistributorAggregator,
    MasterImageBuilderAggregator,
    MasterImageSynchronizerAggregator,
    StorageBucketAggregator,
    TelemetryEventAggregator, createAuthupAggregator,
} from '../aggregators';
import {
    AnalysisMetadataTaskQueue,
    RegistryTaskQueueRouterRouting,
    useAnalysisMetadataComponent,
    useRegistryComponent,
} from '../components';
import {
    configureAmqp,
    configureAuthup,
    configureAuthupClientAuthenticationHook,
    configureEventPublisher,
    configureRedis,
    configureTelemetryClient,
    configureVault,
    setupLogging,
} from './services';

export type Config = {
    aggregators: Component[]
    components: Component[]
};

export function createConfig() : Config {
    setupLogging();

    configureAuthupClientAuthenticationHook();

    configureTelemetryClient();

    configureVault();

    configureAuthup();

    configureRedis();

    configureAmqp();

    configureEventPublisher();

    // ---------------------------------------------

    const aggregators : Component[] = [
        createAuthupAggregator(),

        new QueueWorkerComponentCaller(
            new AnalysisBuilderAggregator(),
            {
                consumeQueue: AnalysisBuilderEventQueueRouterRouting,
            },
        ),
        new QueueWorkerComponentCaller(
            new AnalysisDistributorAggregator(),
            {
                consumeQueue: AnalysisDistributorEventQueueRouterRouting,
            },
        ),
        new QueueWorkerComponentCaller(
            new StorageBucketAggregator(),
            {
                consumeQueue: BucketEventQueueRouterRouting,
            },
        ),

        new QueueWorkerComponentCaller(
            new MasterImageBuilderAggregator(),
            {
                consumeQueue: MasterImageBuilderEventQueueRouterRouting,
            },
        ),
        new QueueWorkerComponentCaller(
            new MasterImageSynchronizerAggregator(),
            {
                consumeQueue: MasterImageSynchronizerEventQueueRouterRouting,
            },
        ),

        new QueueWorkerComponentCaller(
            new TelemetryEventAggregator(),
            {
                consumeQueue: EventEventQueueRouterRouting,
            },
        ),
    ];

    // ---------------------------------------------

    const components : Component[] = [
        new QueueWorkerComponentCaller(
            useRegistryComponent(),
            {
                consumeQueue: RegistryTaskQueueRouterRouting,
            },
        ),
        new QueueWorkerComponentCaller(
            useAnalysisMetadataComponent(),
            {
                consumeQueue: AnalysisMetadataTaskQueue,
            },
        ),
    ];

    return {
        aggregators,
        components,
    };
}
