/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TokenCreatorOptions } from '@authup/core';
import { APIClient, ROBOT_SYSTEM_NAME, mountClientResponseErrorTokenHook } from '@authup/core';
import { setConfig as setAmqpConfig } from 'amqp-extension';
import { createClient } from 'redis-extension';
import { VaultClient } from '@hapic/vault';
import { buildAuthupAggregator, buildTrainManagerAggregator } from '../aggregators';
import {setAuthupClient, setMinioConfig, setRedisClient, setVaultClient} from '../core';
import { EnvironmentName, useEnv } from './env';

import { buildRouterComponent } from '../components';

export type Config = {
    aggregators: {start: () => void}[]
    components: {start: () => void}[]
};

export function createConfig() : Config {
    let vaultClient : VaultClient | undefined;
    let connectionString = useEnv('vaultConnectionString');
    if (typeof connectionString !== 'undefined') {
        vaultClient = new VaultClient({
            connectionString,
        });

        setVaultClient(vaultClient);
    }

    // ---------------------------------------------

    const authupClient = new APIClient({
        baseURL: useEnv('authupApiUrl'),
    });

    let tokenCreator : TokenCreatorOptions;
    if (typeof vaultClient === 'undefined') {
        tokenCreator = {
            type: 'user',
            name: 'admin',
            password: 'start123',
        };
    } else {
        tokenCreator = {
            type: 'robotInVault',
            name: ROBOT_SYSTEM_NAME,
            vault: vaultClient,
        };
    }

    mountClientResponseErrorTokenHook(authupClient, {
        baseURL: useEnv('authupApiUrl'),
        tokenCreator,
    });

    setAuthupClient(authupClient);

    // ---------------------------------------------

    connectionString = useEnv('redisConnectionString');
    if (typeof connectionString !== 'undefined') {
        const redisClient = createClient({
            connectionString,
        });
        setRedisClient(redisClient);
    }

    // ---------------------------------------------

    connectionString = useEnv('rabbitMqConnectionString');
    if(typeof connectionString !== 'undefined') {
        setAmqpConfig({
            connection:,
            exchange: {
                name: 'pht',
                type: 'topic',
            },
        });
    }

    // ---------------------------------------------

    setMinioConfig(useEnv('minioConnectionString'));

    // ---------------------------------------------

    const isTest = useEnv('env') === EnvironmentName.TEST;

    // ---------------------------------------------

    const aggregators : {start: () => void}[] = [];

    if (!isTest) {
        aggregators.push(buildAuthupAggregator());
        aggregators.push(buildTrainManagerAggregator());
    }

    // ---------------------------------------------

    const components : {start: () => void}[] = [];
    if (!isTest) {
        components.push(
            buildRouterComponent(),
        );
    }

    return {
        aggregators,
        components,
    };
}
