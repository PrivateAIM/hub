/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryCacheDriver, TaggedCache } from '@rapiq/cache';
import { RedisCacheDriver } from '@rapiq/cache-redis';
import type { Client } from 'redis-extension';
import {
    TAGGED_CACHE_CONNECT_TIMEOUT,
    TAGGED_CACHE_REDIS_OPTIONS,
    TAGGED_CACHE_TTL,
} from './constants';
import type {
    TaggedCacheClient,
    TaggedCacheCreateInput,
    TaggedCacheCreateResult,
} from './types';

/**
 * The driver prefix: the source client's `keyPrefix`, which the driver
 * client may not carry itself, followed by the service prefix.
 */
export function resolveTaggedCachePrefix(source: Client, prefix: string) : string {
    const { keyPrefix } = source.options;

    if (typeof keyPrefix === 'string' && keyPrefix.length > 0) {
        return `${keyPrefix}${prefix}`;
    }

    return prefix;
}

/**
 * The client the driver gets, without a `keyPrefix` (the driver refuses one,
 * its scripts never see it), and the driver prefix taken from the same source.
 * The source client is left as it is.
 */
export function createTaggedCacheClient(source: Client, prefix: string) : TaggedCacheClient {
    // the driver's ready() opens the connection.
    const client = source.duplicate({
        ...TAGGED_CACHE_REDIS_OPTIONS,
        keyPrefix: undefined,
        lazyConnect: true,
    });

    return {
        client,
        prefix: resolveTaggedCachePrefix(source, prefix),
    };
}

export function createTaggedCache(input: TaggedCacheCreateInput) : TaggedCacheCreateResult {
    if (!input.redis) {
        return {
            cache: new TaggedCache({
                driver: new MemoryCacheDriver({ maxTtl: TAGGED_CACHE_TTL }),
                ttl: TAGGED_CACHE_TTL,
                onError: input.onError,
            }),
            ready: async () => {},
            dispose: async () => {},
        };
    }

    const { client, prefix } = createTaggedCacheClient(input.redis, input.prefix);

    client.on('error', (error) => input.onError(error));

    const driver = new RedisCacheDriver({
        client,
        prefix,
        maxTtl: TAGGED_CACHE_TTL,
    });

    return {
        cache: new TaggedCache({
            driver,
            ttl: TAGGED_CACHE_TTL,
            onError: input.onError,
        }),
        ready: async () => {
            await driver.ready(TAGGED_CACHE_CONNECT_TIMEOUT);
        },
        dispose: async () => {
            client.disconnect();
        },
    };
}
