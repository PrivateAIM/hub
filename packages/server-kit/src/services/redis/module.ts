/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Client as RedisClient,
    ClientOptions as RedisClientOptions,
    createClient as createRedisClient,
} from 'redis-extension';

export {
    createRedisClient,
    RedisClient,
    RedisClientOptions,
};
