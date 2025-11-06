/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Aggregator, Component } from '@privateaim/server-kit';
import {
    createAuthupAggregator,
    createTelemetryAggregator,
} from '../aggregators';
import {
    createAnalysisBuilderAggregator,
    createAnalysisCoreAggregator,
    createAnalysisDistributorAggregator,
    createMasterImagesAggregator,
} from '../aggregators/analysis-manager';
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
    aggregators: Aggregator[]
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

    const aggregators : Aggregator[] = [
        createAuthupAggregator(),

        createAnalysisBuilderAggregator(),
        createAnalysisDistributorAggregator(),
        createAnalysisCoreAggregator(),

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
