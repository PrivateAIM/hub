/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ITaggedCache } from '@rapiq/cache';
import { rememberQuery } from '@rapiq/cache';
import { CacheInvalidationSubscriber, isTransactionActive } from '@rapiq/cache/typeorm';
import type { SchemaRegistry } from '@rapiq/core';
import type { DataSource } from 'typeorm';
import { QUERY_CACHE_SCOPED_VALUE_NORMALIZER } from './constants.ts';
import type {
    IQueryCache,
    QueryCacheContext,
    QueryCacheQueryInput,
    QueryCacheReadOptions,
    QueryCacheSubscriberOptions,
} from './types.ts';

/**
 * Reads through a tag-invalidated cache (`@rapiq/cache`), or straight from
 * the database without one and inside an open transaction. A failed
 * invalidation stays pending in the cache, which bypasses and replays it
 * (tada5hi/rapiq#993); other processes sharing the store are not reached.
 */
export class QueryCache implements IQueryCache {
    protected dataSource: DataSource;

    protected registry: SchemaRegistry;

    protected cache: ITaggedCache | undefined;

    constructor(ctx: QueryCacheContext) {
        this.dataSource = ctx.dataSource;
        this.registry = ctx.registry;
        this.cache = ctx.cache;
    }

    async remember<T>(
        key: string,
        tags: (value: T) => string[],
        read: () => Promise<T>,
        options: QueryCacheReadOptions = {},
    ): Promise<T> {
        if (!this.cache || this.isTransactionActive(options)) {
            return read();
        }

        return this.cache.remember(key, read, { tags });
    }

    async rememberQuery<T>(
        input: QueryCacheQueryInput<T>,
        read: () => Promise<T>,
        options: QueryCacheReadOptions = {},
    ): Promise<T> {
        if (!this.cache || this.isTransactionActive(options)) {
            return read();
        }

        return rememberQuery(this.cache, {
            ...input,
            registry: this.registry,
            normalizeScopedValue: QUERY_CACHE_SCOPED_VALUE_NORMALIZER,
        }, read);
    }

    /**
     * The write side, sharing the registry and the scoped value spelling
     * with the reads. `undefined` without a cache: nothing to invalidate.
     * Push it onto `dataSource.subscribers` after every `initialize()`,
     * which rebuilds that array.
     */
    createSubscriber(options: QueryCacheSubscriberOptions): CacheInvalidationSubscriber | undefined {
        if (!this.cache) {
            return undefined;
        }

        return new CacheInvalidationSubscriber({
            cache: this.cache,
            registry: this.registry,
            normalizeScopedValue: QUERY_CACHE_SCOPED_VALUE_NORMALIZER,
            resolveSchemaName: options.resolveSchemaName,
            onError: options.onError,
        });
    }

    /**
     * A read inside an open transaction can see its uncommitted writes,
     * which a rollback never bumps away. On a driver sharing one
     * connection (better-sqlite3) any open transaction counts.
     */
    protected isTransactionActive(options: QueryCacheReadOptions): boolean {
        return isTransactionActive(this.dataSource, options.manager);
    }
}
