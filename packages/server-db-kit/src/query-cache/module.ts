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
    QueryCacheInvalidator,
    QueryCacheQueryInput,
    QueryCacheReadOptions,
    QueryCacheSubscriberOptions,
} from './types.ts';

/**
 * Reads through a tag-invalidated cache (`@rapiq/cache`), or straight from
 * the database without one, inside an open transaction, and for one ttl
 * after a failed invalidation (authup/authup#3688).
 */
export class QueryCache implements IQueryCache {
    protected dataSource: DataSource;

    protected registry: SchemaRegistry;

    protected ttl: number;

    protected cache: ITaggedCache | undefined;

    protected now: () => number;

    protected suspendedUntil: number | undefined;

    constructor(ctx: QueryCacheContext) {
        this.dataSource = ctx.dataSource;
        this.registry = ctx.registry;
        this.ttl = ctx.ttl;
        this.cache = ctx.cache;
        this.now = ctx.now ?? (() => Date.now());
    }

    async remember<T>(
        key: string,
        tags: (value: T) => string[],
        read: () => Promise<T>,
        options: QueryCacheReadOptions = {},
    ): Promise<T> {
        if (!this.cache || this.isBypassed(options)) {
            return read();
        }

        return this.cache.remember(key, read, { tags });
    }

    async rememberQuery<T>(
        input: QueryCacheQueryInput<T>,
        read: () => Promise<T>,
        options: QueryCacheReadOptions = {},
    ): Promise<T> {
        if (!this.cache || this.isBypassed(options)) {
            return read();
        }

        return rememberQuery(this.cache, {
            ...input,
            registry: this.registry,
            normalizeScopedValue: QUERY_CACHE_SCOPED_VALUE_NORMALIZER,
        }, read);
    }

    /**
     * What the invalidation subscriber bumps through. A rejected bump
     * leaves the entries carrying those tags in the store, so this
     * process reads past the cache until every such entry has lapsed,
     * one entry ttl from the failure. Other processes sharing the store
     * are not reached (tada5hi/rapiq#993).
     */
    createInvalidator(): QueryCacheInvalidator {
        return {
            invalidate: async (tags: string[]) => {
                if (!this.cache) {
                    return;
                }

                try {
                    await this.cache.invalidate(tags);
                } catch (e) {
                    this.suspendedUntil = this.now() + this.ttl;

                    throw e;
                }
            },
        };
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
            cache: this.createInvalidator(),
            registry: this.registry,
            normalizeScopedValue: QUERY_CACHE_SCOPED_VALUE_NORMALIZER,
            resolveSchemaName: options.resolveSchemaName,
            onError: options.onError,
        });
    }

    protected isBypassed(options: QueryCacheReadOptions): boolean {
        return this.isSuspended() || this.isTransactionActive(options);
    }

    protected isSuspended(): boolean {
        return typeof this.suspendedUntil !== 'undefined' && this.now() < this.suspendedUntil;
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
