/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useRedisClient, useRedisPublishClient, useRedisSubscribeClient } from '@privateaim/server-kit';
import { WRITABLE_DIR_PATH } from './constants';
import { setupLogger, setupRedis } from './services';
import type { Config } from './type';

export function createConfig() : Config {
    setupLogger({
        directory: WRITABLE_DIR_PATH,
    });

    setupRedis();

    return {
        redisDatabase: useRedisClient(),
        redisPub: useRedisPublishClient(),
        redisSub: useRedisSubscribeClient(),
    };
}
