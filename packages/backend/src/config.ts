/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    HarborAPI, ProxyConnectionConfig, VaultAPI, detectProxyConnectionConfig,
} from '@personalhealthtrain/ui-common';
import { setTrapiClientConfig } from '@trapi/client';
import { setConfig } from 'amqp-extension';
import https from 'https';
import { Redis, setRedisConfig, useRedisInstance } from 'redis-extension';
import { buildDispatcherComponent } from './components/event-dispatcher';
import { Environment } from './env';
import { buildTrainBuilderAggregator } from './aggregators/train-builder';
import { buildTrainResultAggregator } from './aggregators/train-result';
import { buildDispatcherAggregator } from './aggregators/dispatcher';
import { buildCommandRouterComponent } from './components/command-router';
import { buildTrainRouterAggregator } from './aggregators/train-router';
import { ApiKey } from './config/api';

interface ConfigContext {
    env: Environment
}

export type Config = {
    redisDatabase: Redis,
    redisPub: Redis,
    redisSub: Redis,

    aggregators: {start: () => void}[]
    components: {start: () => void}[]
};

export function createConfig({ env } : ConfigContext) : Config {
    let proxyAPis : string[] = [];
    if (env.httpProxyAPIs) {
        proxyAPis = env.httpProxyAPIs.split(',').map((api) => api.toLowerCase());
    }

    const proxyConfig : ProxyConnectionConfig | undefined = detectProxyConnectionConfig();

    setTrapiClientConfig(ApiKey.HARBOR, {
        clazz: HarborAPI,
        connectionString: env.harborConnectionString,
        driver: {
            ...(proxyAPis.includes('harbor') && proxyConfig ? {
                proxy: proxyConfig,
            } : {
                proxy: false,
            }),
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        },
    });

    setTrapiClientConfig(ApiKey.VAULT, {
        clazz: VaultAPI,
        connectionString: env.vaultConnectionString,
        driver: {
            ...(proxyAPis.includes('vault') && proxyConfig ? {
                proxy: proxyConfig,
            } : {
                proxy: false,
            }),
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        },
    });

    setRedisConfig('default', { connectionString: env.redisConnectionString });

    const redisDatabase = useRedisInstance('default');
    const redisPub = redisDatabase.duplicate();
    const redisSub = redisDatabase.duplicate();

    setConfig({
        connection: env.rabbitMqConnectionString,
        exchange: {
            name: 'pht',
            type: 'topic',
        },
    });

    const aggregators : {start: () => void}[] = [
        buildDispatcherAggregator(),
        buildTrainBuilderAggregator(),
        buildTrainResultAggregator(),
        buildTrainRouterAggregator(),
    ];

    const components : {start: () => void}[] = [
        buildCommandRouterComponent(),
        buildDispatcherComponent(),
    ];

    return {
        redisDatabase,
        redisPub,
        redisSub,

        aggregators,
        components,
    };
}
