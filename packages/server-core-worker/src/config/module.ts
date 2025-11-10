/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Component } from '@privateaim/server-kit';
import {
    createCoreComponent,
    createMasterImagesComponent,
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
        useAnalysisDistributorComponent(),
        useAnalysisBuilderComponent(),

        createCoreComponent(),
        createMasterImagesComponent(),
    ];

    return {
        aggregators,
        components,
    };
}

export default createConfig;
