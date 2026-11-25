/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryCacheDriver, TaggedCache, isCacheError } from '@rapiq/cache';
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

/**
 * The log line of a cache failure. A lost invalidation names its tags and
 * carries the driver failure as `cause`, which its own message omits.
 */
export function formatTaggedCacheError(error: unknown) : string {
    const message = Error.isError(error) ? error.message : String(error);

    if (!isCacheError(error)) {
        return message;
    }

    const parts = [message];

    if (error.tags.length > 0) {
        parts.push(`tags: ${error.tags.length}`);
    }

    if (typeof error.cause !== 'undefined') {
        parts.push(`cause: ${Error.isError(error.cause) ? error.cause.message : String(error.cause)}`);
    }

    return parts.join(', ');
}

export function createTaggedCache(input: TaggedCacheCreateInput) : TaggedCacheCreateResult {
    if (!input.redis) {
        const cache = new TaggedCache({
            driver: new MemoryCacheDriver({ maxTtl: TAGGED_CACHE_TTL }),
            ttl: TAGGED_CACHE_TTL,
            onError: input.onError,
        });

        return {
            cache,
            ready: async () => {},
            dispose: async () => {
                cache.dispose();
            },
        };
    }

    const { client, prefix } = createTaggedCacheClient(input.redis, input.prefix);

    client.on('error', (error) => input.onError(error));

    const driver = new RedisCacheDriver({
        client,
        prefix,
        maxTtl: TAGGED_CACHE_TTL,
    });

    const cache = new TaggedCache({
        driver,
        ttl: TAGGED_CACHE_TTL,
        onError: input.onError,
    });

    return {
        cache,
        ready: async () => {
            await driver.ready(TAGGED_CACHE_CONNECT_TIMEOUT);
        },
        dispose: async () => {
            // stop the replay timer first: no replay reaches a closed client.
            cache.dispose();
            client.disconnect();
        },
    };
}
