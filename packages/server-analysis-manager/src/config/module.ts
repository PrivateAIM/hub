/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TokenCreatorOptions } from '@authup/core-http-kit';
import type { Aggregator, Component } from '@privateaim/server-kit';
import { buildComponentRouter } from '../components';
import { useEnv } from './env';
import {
    configureAMQP,
    configureCoreService,
    configureStorageService,
} from './services';

export type Config = {
    aggregators: {start: () => void}[]
    components: {start: () => void}[]
};

export function createConfig() : Config {
    const tokenCreator : TokenCreatorOptions = {
        type: 'robotInVault',
        name: 'system',
        vault: useEnv('vaultConnectionString'),
    };

    configureStorageService({ tokenCreator });
    configureCoreService({ tokenCreator });
    configureAMQP();

    const aggregators : Aggregator[] = [];

    const components : Component[] = [
        buildComponentRouter(),
    ];

    return {
        aggregators,
        components,
    };
}

export default createConfig;
