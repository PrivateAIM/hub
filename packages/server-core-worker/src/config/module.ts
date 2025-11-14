/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Component } from '@privateaim/server-kit';
import { QueueWorkerComponentCaller } from '@privateaim/server-kit';
import {
    AnalysisBuilderEventQueueRouterRouting,
    AnalysisBuilderTaskQueueRouterRouting,
    AnalysisDistributorEventQueueRouterRouting,
    AnalysisDistributorTaskQueueRouterRouting, MasterImageSynchronizerEventQueueRouterRouting,
    MasterImageSynchronizerTaskQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import {
    createMasterImagesComponent, MasterImageSynchronizerComponent,
    useAnalysisBuilderComponent,
    useAnalysisDistributorComponent,
} from '../components';
import {
    configureAMQP, configureCoreService, configureStorageService, setupLogger, setupVault,
} from './services';
import { configureAuthupClientAuthenticationHook } from './services/authup-client-authentication-hook';
import type { Config } from './types';

export function createConfig() : Config {
    setupLogger();
    setupVault();
    configureAMQP();

    configureAuthupClientAuthenticationHook();

    configureStorageService();
    configureCoreService();

    const aggregators : Component[] = [];

    const components : Component[] = [
        new QueueWorkerComponentCaller(
            useAnalysisBuilderComponent(),
            {
                publishQueue: AnalysisBuilderEventQueueRouterRouting,
                consumeQueue: AnalysisBuilderTaskQueueRouterRouting,
            },
        ),
        new QueueWorkerComponentCaller(
            useAnalysisDistributorComponent(),
            {
                publishQueue: AnalysisDistributorEventQueueRouterRouting,
                consumeQueue: AnalysisDistributorTaskQueueRouterRouting,
            },
        ),

        new QueueWorkerComponentCaller(
            new MasterImageSynchronizerComponent(),
            {
                publishQueue: MasterImageSynchronizerEventQueueRouterRouting,
                consumeQueue: MasterImageSynchronizerTaskQueueRouterRouting
            }
        ),

        createMasterImagesComponent(),
    ];

    return {
        aggregators,
        components,
    };
}

export default createConfig;
