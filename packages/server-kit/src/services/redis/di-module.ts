/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule } from 'orkos';
import { ModuleName } from '../module-names';
import { RedisClientInjectionKey, RedisPublishClientInjectionKey, RedisSubscribeClientInjectionKey } from './constants';
import { createRedisClient } from './module';

export type RedisModuleOptions = {
    connectionString?: string;
};

export class RedisModule implements IModule {
    readonly name = ModuleName.REDIS;

    readonly dependencies: string[] = [];

    private options: RedisModuleOptions;

    constructor(options: RedisModuleOptions = {}) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        if (!this.options.connectionString) {
            return;
        }

        const client = createRedisClient({ connectionString: this.options.connectionString });
        container.register(RedisClientInjectionKey, { useValue: client });
        container.register(RedisPublishClientInjectionKey, { useFactory: () => client.duplicate() });
        container.register(RedisSubscribeClientInjectionKey, { useFactory: () => client.duplicate() });
    }
}
