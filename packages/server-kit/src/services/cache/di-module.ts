/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency  } from 'orkos';
import { RedisClientInjectionKey } from '../redis/constants';
import { ModuleName } from '../module-names';
import { CacheInjectionKey } from './constants';
import type { CacheAdapter } from './adapters';
import { MemoryCacheAdapter, RedisCacheAdapter } from './adapters';
import { Cache } from './module';

export class CacheModule implements IModule {
    readonly name = ModuleName.CACHE;

    readonly dependencies: (string | ModuleDependency)[] = [
        { name: ModuleName.REDIS, optional: true },
    ];

    async setup(container: IContainer): Promise<void> {
        let adapter: CacheAdapter;

        const result = container.tryResolve(RedisClientInjectionKey);
        if (result.success) {
            adapter = new RedisCacheAdapter();
        } else {
            adapter = new MemoryCacheAdapter();
        }

        const cache = new Cache(adapter);
        container.register(CacheInjectionKey, { useValue: cache });
    }
}
