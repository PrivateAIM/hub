/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TokenCreatorOptions } from '@authup/core';
import { APIClient, mountClientResponseErrorTokenHook } from '@authup/core';
import { isBoolFalse, isBoolTrue } from '@privateaim/core';
import { hasConfig as hasAmqpConfig, setConfig as setAmqpConfig } from 'amqp-extension';
import { createClient } from 'redis-extension';
import { VaultClient } from '@hapic/vault';
import { buildAuthupAggregator, buildTrainManagerAggregator } from '../aggregators';
import {
    setAuthupClient,
    setRedisClient,
    setVaultClient,
} from '../core';
import { ConfigDefaults, EnvironmentName, useEnv } from './env';

import { buildRouterComponent } from '../components';

export type Config = {
    aggregators: {start: () => void}[]
    components: {start: () => void}[]
};

export function createConfig() : Config {
    let vaultClient : VaultClient | undefined;
    let connectionString = useEnv('vaultConnectionString');
    if (
        typeof connectionString !== 'undefined' &&
        !isBoolFalse(connectionString)
    ) {
        vaultClient = new VaultClient({
            connectionString: isBoolTrue(connectionString) ? ConfigDefaults.VAULT : connectionString,
        });

        setVaultClient(vaultClient);
    }

    // ---------------------------------------------

    const authupClient = new APIClient({
        baseURL: useEnv('authupApiURL'),
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
            name: 'system',
            vault: vaultClient,
        };
    }

    mountClientResponseErrorTokenHook(authupClient, {
        baseURL: useEnv('authupApiURL'),
        tokenCreator,
    });

    setAuthupClient(authupClient);

    // ---------------------------------------------

    connectionString = useEnv('redisConnectionString');
    if (
        typeof connectionString !== 'undefined' &&
        !isBoolFalse(connectionString)
    ) {
        const redisClient = createClient({
            connectionString: isBoolTrue(connectionString) ?
                ConfigDefaults.REDIS :
                connectionString,
        });
        setRedisClient(redisClient);
    }

    // ---------------------------------------------

    connectionString = useEnv('rabbitMqConnectionString');
    if (
        typeof connectionString !== 'undefined' &&
        !isBoolFalse(connectionString)
    ) {
        setAmqpConfig({
            connection: isBoolTrue(connectionString) ? ConfigDefaults.RABBITMQ : connectionString,
            exchange: {
                name: 'pht',
                type: 'topic',
            },
        });
    }

    // ---------------------------------------------

    const isTest = useEnv('env') === EnvironmentName.TEST;

    // ---------------------------------------------

    const aggregators : {start: () => void}[] = [];

    if (
        !isTest &&
        hasAmqpConfig()
    ) {
        aggregators.push(buildAuthupAggregator());
        aggregators.push(buildTrainManagerAggregator());
    }

    // ---------------------------------------------

    const components : {start: () => void}[] = [];
    if (
        !isTest &&
        hasAmqpConfig()
    ) {
        components.push(
            buildRouterComponent(),
        );
    }

    return {
        aggregators,
        components,
    };
}
