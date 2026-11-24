/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTokenCache } from '@authup/server-adapter-kit';
import { REDIS_TOKEN_CACHE_CLIENT_OPTIONS, RedisTokenCache } from '@authup/server-adapter-redis';
import type { AuthupTokenCacheCreateInput, AuthupTokenCacheCreateResult } from './types.ts';

/**
 * The token result cache of a service's verifiers. With Redis it runs on a
 * dedicated duplicate of `redis` carrying authup's bounded client options
 * (one retry, no offline queue, 500 ms command timeout), so a Redis outage
 * falls through to verification fast instead of queueing behind the shared
 * client. The duplicate keeps the source's `keyPrefix`, so the keys stay
 * those of a cache over the source client. Without Redis: process memory.
 *
 * The caller owns the result: `dispose()` disconnects the dedicated client.
 */
export function createAuthupTokenCache(input: AuthupTokenCacheCreateInput = {}): AuthupTokenCacheCreateResult {
    if (!input.redis) {
        return {
            cache: new MemoryTokenCache(),
            dispose: () => {},
        };
    }

    const client = input.redis.duplicate({
        ...REDIS_TOKEN_CACHE_CLIENT_OPTIONS,
        // connect now: with no offline queue a lazy client fails its first command.
        lazyConnect: false,
    });

    // without a listener ioredis reports every connection error as unhandled.
    client.on('error', (error: Error) => input.onError?.(error));

    return {
        cache: new RedisTokenCache(client),
        dispose: () => {
            client.disconnect();
        },
    };
}
