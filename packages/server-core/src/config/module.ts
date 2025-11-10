/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Component } from '@privateaim/server-kit';
import {
    AnalysisBuilderAggregator,
    AnalysisDistributorAggregator,
    StorageBucketAggregator,
    createAuthupAggregator,
    createMasterImagesAggregator,
    createTelemetryAggregator,
} from '../aggregators';
import {
    createRegistryComponent,
    useAnalysisMetadataComponent,
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

        new AnalysisBuilderAggregator(),
        new AnalysisDistributorAggregator(),

        new StorageBucketAggregator(),

        createMasterImagesAggregator(),
        createTelemetryAggregator(),
    ];

    // ---------------------------------------------

    const components : Component[] = [
        createRegistryComponent(),
        useAnalysisMetadataComponent(),
    ];

    return {
        aggregators,
        components,
    };
}
