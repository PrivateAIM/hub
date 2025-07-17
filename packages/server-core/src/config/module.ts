/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Aggregator, Component } from '@privateaim/server-kit';
import { createAnalysisManagerBuilderAggregator, createAuthupAggregator } from '../aggregators';
import {
    createAnalysisManagerCoreAggregator,
    createAnalysisManagerMasterImagesAggregator,
} from '../aggregators/analysis-manager';
import {
    createMasterImageLogCleanerComponent,
    createRegistryComponent,
} from '../components';
import { getWritableDirPath } from './paths';
import {
    configureAmqp,
    configureAuthup,
    configureAuthupClientAuthenticationHook, configureLoki,
    configureRedis,
    configureVault,
    setupLogging,
} from './services';

export type Config = {
    aggregators: Aggregator[]
    components: Component[]
};

export function createConfig() : Config {
    configureLoki();

    setupLogging({
        directory: getWritableDirPath(),
    });

    configureAuthupClientAuthenticationHook();

    configureVault();

    configureAuthup();

    configureRedis();

    configureAmqp();

    // ---------------------------------------------

    const aggregators : Aggregator[] = [
        createAuthupAggregator(),
        createAnalysisManagerBuilderAggregator(),
        createAnalysisManagerCoreAggregator(),
        createAnalysisManagerMasterImagesAggregator(),
    ];

    // ---------------------------------------------

    const components : Component[] = [
        createMasterImageLogCleanerComponent(),
        createRegistryComponent(),
    ];

    return {
        aggregators,
        components,
    };
}
