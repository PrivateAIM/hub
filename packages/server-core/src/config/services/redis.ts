/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isBoolFalse, isBoolTrue } from '@privateaim/kit';
import { createRedisClient, setRedisFactory } from '@privateaim/server-kit';
import { ConfigDefaults, useEnv } from '../env';

export function configureRedis() {
    const connectionString = useEnv('redisConnectionString');
    if (
        typeof connectionString !== 'undefined' &&
        !isBoolFalse(connectionString)
    ) {
        setRedisFactory(() => createRedisClient({
            connectionString: isBoolTrue(connectionString) ?
                ConfigDefaults.REDIS :
                connectionString,
        }));
    }
}
