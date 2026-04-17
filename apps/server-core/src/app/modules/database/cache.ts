/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { QueryResultCache } from 'typeorm/cache/QueryResultCache.js';
import type { QueryResultCacheOptions } from 'typeorm/cache/QueryResultCacheOptions.js';
import type { Client as RedisClient } from 'redis-extension';

type DatabaseQueryResultCacheOptions = {
    redisClient?: RedisClient,

    redisAlias?: string,

    redisKeyPrefix?: string
};

export class DatabaseQueryResultCache implements QueryResultCache {
    protected options: DatabaseQueryResultCacheOptions;

    protected redisClient?: RedisClient;

    constructor(options?: DatabaseQueryResultCacheOptions) {
        options = options || {};

        this.options = options;
        this.redisClient = options.redisClient;
    }

    protected buildFullQualifiedId(id: string) {
        if (this.options.redisKeyPrefix) {
            return `${this.options.redisKeyPrefix}:${id}`;
        }

        return `database:${id}`;
    }

    protected clearQuery(query: string) {
        return query.replace(/[^a-zA-Z0-9_-]+/g, '');
    }

    async clear(): Promise<void> {
        if (!this.redisClient) {
            return;
        }

        const pipeline = this.redisClient.pipeline();

        const keys = await this.redisClient.keys(this.buildFullQualifiedId('*'));
        for (const key of keys) {
            pipeline.del(key);
        }

        await pipeline.exec();
    }

    async connect(): Promise<void> {
        return Promise.resolve(undefined);
    }

    async disconnect(): Promise<void> {
        return Promise.resolve(undefined);
    }

    async getFromCache(options: QueryResultCacheOptions): Promise<QueryResultCacheOptions | undefined> {
        if (!this.redisClient) {
            return undefined;
        }

        // todo: allow options.query

        if (!options.identifier) {
            return undefined;
        }

        const key = this.buildFullQualifiedId(options.identifier || options.query);

        const data = await this.redisClient.get(
            key,
        );

        if (!data) {
            return undefined;
        }

        return JSON.parse(data);
    }

    isExpired(savedCache: QueryResultCacheOptions): boolean {
        if (typeof savedCache.time === 'undefined') {
            return true;
        }

        return savedCache.time + savedCache.duration < new Date().getTime();
    }

    async remove(identifiers: string[]): Promise<void> {
        if (!this.redisClient) {
            return;
        }

        const pipeline = this.redisClient.pipeline();

        for (const identifier of identifiers) {
            pipeline.del(this.buildFullQualifiedId(identifier));
        }

        await pipeline.exec();
    }

    async storeInCache(
        options: QueryResultCacheOptions,
    ): Promise<void> {
        if (!this.redisClient) {
            return;
        }

        // todo: allow options.query

        if (!options.identifier) {
            return;
        }

        const key = this.buildFullQualifiedId(options.identifier || options.query);

        await this.redisClient.set(
            key,
            JSON.stringify(options),
            'PX',
            options.duration,
        );
    }

    synchronize(): Promise<void> {
        return Promise.resolve(undefined);
    }
}
