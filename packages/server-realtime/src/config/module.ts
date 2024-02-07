/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ROBOT_SYSTEM_NAME, mountClientResponseErrorTokenHook } from '@authup/core';
import { APIClient } from '@privateaim/core';
import { setConfig as setRedisConfig, useClient as useRedisClient } from 'redis-extension';
import { setAPIClient } from '../core';
import { useEnv } from './env';
import type { Config } from './type';

export function createConfig() : Config {
    setRedisConfig({ connectionString: useEnv('redisConnectionString') });

    const apiClient = new APIClient({
        baseURL: useEnv('apiURL'),
    });
    mountClientResponseErrorTokenHook(apiClient, {
        baseURL: useEnv('authupApiURL'),
        tokenCreator: {
            type: 'robotInVault',
            name: ROBOT_SYSTEM_NAME,
            vault: useEnv('vaultConnectionString'),
        },
    });
    setAPIClient(apiClient);

    const redisDatabase = useRedisClient();
    const redisPub = redisDatabase.duplicate();
    const redisSub = redisDatabase.duplicate();

    return {
        redisDatabase,
        redisPub,
        redisSub,
    };
}
