/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import { CONFIG_MODULE_NAME, ConfigInjectionKey } from '../config/constants';
import {
    REDIS_MODULE_NAME,
    RedisClientInjectionKey,
    RedisPublishClientInjectionKey,
    RedisSubscribeClientInjectionKey,
} from './constants';
import { createRedisClient } from './module';

export type RedisModuleOptions = {
    connectionString?: string;
};

export class RedisModule implements IModule {
    readonly name = REDIS_MODULE_NAME;

    readonly dependencies: (string | ModuleDependency)[] = [
        { name: CONFIG_MODULE_NAME, optional: true },
    ];

    private options: RedisModuleOptions;

    constructor(options: RedisModuleOptions = {}) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        let { connectionString } = this.options;

        if (!connectionString) {
            const configResult = container.tryResolve(ConfigInjectionKey);
            if (configResult.success) {
                connectionString = configResult.data.redisConnectionString;
            }
        }

        if (!connectionString) {
            return;
        }

        const client = createRedisClient({ connectionString });
        container.register(RedisClientInjectionKey, { useValue: client });
        container.register(RedisPublishClientInjectionKey, { useFactory: () => client.duplicate() });
        container.register(RedisSubscribeClientInjectionKey, { useFactory: () => client.duplicate() });
    }
}
