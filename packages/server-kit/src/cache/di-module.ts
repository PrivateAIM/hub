/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IContainer } from 'eldin';
import type { IModule, ModuleDependency } from 'orkos';
import { LOGGER_MODULE_NAME, LoggerInjectionKey } from '../logger/constants';
import { REDIS_MODULE_NAME, RedisClientInjectionKey } from '../redis/constants';
import {
    TAGGED_CACHE_ERROR_LOG_INTERVAL,
    TAGGED_CACHE_MODULE_NAME,
    TaggedCacheInjectionKey,
} from './constants';
import { createTaggedCache } from './module';
import { throttle } from './throttle';
import type { TaggedCacheModuleOptions } from './types';

export class TaggedCacheModule implements IModule {
    readonly name = TAGGED_CACHE_MODULE_NAME;

    readonly dependencies: (string | ModuleDependency)[] = [
        { name: REDIS_MODULE_NAME, optional: true },
        { name: LOGGER_MODULE_NAME, optional: true },
    ];

    protected options: TaggedCacheModuleOptions;

    protected dispose: (() => Promise<void>) | undefined;

    constructor(options: TaggedCacheModuleOptions) {
        this.options = options;
    }

    async setup(container: IContainer): Promise<void> {
        const redis = container.tryResolve(RedisClientInjectionKey);

        // a Redis outage reports on every reconnect attempt and every cached read.
        const onError = throttle((error: unknown) => {
            const logger = container.tryResolve(LoggerInjectionKey);

            if (!logger.success) {
                return;
            }

            const message = Error.isError(error) ? error.message : String(error);

            logger.data.warn(`The tagged cache failed: ${message}`);
        }, TAGGED_CACHE_ERROR_LOG_INTERVAL);

        const tagged = createTaggedCache({
            redis: redis.success ? redis.data : undefined,
            prefix: this.options.prefix,
            onError,
        });

        this.dispose = tagged.dispose;
        await tagged.ready();

        container.register(TaggedCacheInjectionKey, { useValue: tagged.cache });
    }

    async teardown(container: IContainer): Promise<void> {
        const { dispose } = this;

        this.dispose = undefined;

        if (container.has(TaggedCacheInjectionKey)) {
            container.unregister(TaggedCacheInjectionKey);
        }

        // only the duplicated client closes; the service client belongs to the redis module.
        await dispose?.();
    }
}
