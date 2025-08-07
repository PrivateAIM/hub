/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createRedisClient, setRedisFactory } from '@privateaim/server-kit';
import { useEnv } from '../env';

export function configureRedis() {
    const connectionString = useEnv('redisConnectionString');
    if (!connectionString) {
        // todo: log debug message
        return;
    }

    setRedisFactory(() => createRedisClient({
        connectionString,
    }));
}
