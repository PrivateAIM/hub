/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@privateaim/core-kit';
import { QueryCache } from '@privateaim/server-db-kit';
import {
    LoggerInjectionKey,
    TAGGED_CACHE_ERROR_LOG_INTERVAL,
    TAGGED_CACHE_TTL,
    TaggedCacheInjectionKey,
    throttle,
} from '@privateaim/server-kit';
import type { IContainer } from 'eldin';
import type {
    DataSource,
    EntityMetadata,
    EntityTarget,
    ObjectLiteral,
} from 'typeorm';
import { schemaRegistry } from '../../../core/index.ts';
import { DatabaseInjectionKey } from './constants.ts';
import { SCHEMA_ENTITY_TARGETS } from './schema-targets.ts';

// append-only event log no cached read carries a tag of, so a write bumps nothing.
const CACHE_SCHEMA_NAMES_UNTRACKED = new Set<string>([
    DomainType.ANALYSIS_NODE_EVENT,
]);

const CACHE_SCHEMA_NAMES = new Map<EntityTarget<ObjectLiteral>, string>(
    Object.entries(SCHEMA_ENTITY_TARGETS)
        .filter(([name]) => !CACHE_SCHEMA_NAMES_UNTRACKED.has(name))
        .map(([name, target]) => [target, name] as const),
);

/**
 * The cache schema name of an entity, `undefined` for a table the cache
 * does not track.
 */
export function resolveCacheSchemaName(metadata: EntityMetadata): string | undefined {
    return CACHE_SCHEMA_NAMES.get(metadata.target);
}

/**
 * Build the read cache over the tagged cache, if one is registered, and
 * push its invalidation subscriber. `initialize()` rebuilds
 * `dataSource.subscribers`, so this runs after it.
 */
export function registerQueryCache(container: IContainer, dataSource: DataSource): QueryCache {
    const cacheResult = container.tryResolve(TaggedCacheInjectionKey);
    const queryCache = new QueryCache({
        dataSource,
        registry: schemaRegistry,
        ttl: TAGGED_CACHE_TTL,
        cache: cacheResult.success ? cacheResult.data : undefined,
    });

    const subscriber = queryCache.createSubscriber({
        resolveSchemaName: resolveCacheSchemaName,
        // every commit on a tracked table reports while Redis is down.
        onError: throttle((error: unknown) => {
            const logger = container.tryResolve(LoggerInjectionKey);

            if (logger.success) {
                logger.data.warn(`The cache invalidation failed: ${Error.isError(error) ? error.message : String(error)}`);
            }
        }, TAGGED_CACHE_ERROR_LOG_INTERVAL),
    });

    if (subscriber) {
        dataSource.subscribers.push(subscriber);
    }

    container.register(DatabaseInjectionKey.QueryCache, { useValue: queryCache });

    return queryCache;
}
