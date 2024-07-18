/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Aggregator, Component } from '@privateaim/server-kit';
import { guessAuthupTokenCreatorOptions } from '@privateaim/server-kit';
import {
    createBuilderComponent, createCoreComponent, createMasterImagesComponent,
} from '../components';
import {
    configureAMQP, configureCoreService, configureStorageService, setupLogger, setupVault,
} from './services';
import type { Config } from './types';

export function createConfig() : Config {
    setupLogger();
    setupVault();
    configureAMQP();

    const tokenCreator = guessAuthupTokenCreatorOptions();
    configureStorageService({ tokenCreator });
    configureCoreService({ tokenCreator });

    const aggregators : Aggregator[] = [];

    const components : Component[] = [
        createBuilderComponent(),
        createCoreComponent(),
        createMasterImagesComponent(),
    ];

    return {
        aggregators,
        components,
    };
}

export default createConfig;
