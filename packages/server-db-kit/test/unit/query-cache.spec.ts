/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import type { ICacheDriver } from '@rapiq/cache';
import {
    CacheError,
    MemoryCacheDriver,
    TaggedCache,
    buildCollectionTag,
    buildRecordTag,
    buildScopedTag,
} from '@rapiq/cache';
import { CacheInvalidationSubscriber } from '@rapiq/cache/typeorm';
import { SchemaRegistry, defineQuery, defineSchema } from '@rapiq/core';
import { DataSource } from 'typeorm';
import { QueryCache } from '../../src/index.ts';

const TTL = 60_000;

type Item = {
    id: string,
    ownerId: string,
    name: string,
};

const registry = new SchemaRegistry();

registry.add(defineSchema<Item>({
    name: 'item',
    indexes: [['id'], ['ownerId']],
    fields: { allowed: ['id', 'ownerId', 'name'] },
    filters: { allowed: ['id', 'ownerId', 'name'] },
}));

/**
 * A memory driver whose next `invalidate` calls reject without bumping,
 * as a store outage does.
 */
class FailingCacheDriver extends MemoryCacheDriver {
    failures = 0;

    override async invalidate(tags: string[]): Promise<void> {
        if (this.failures > 0) {
            this.failures--;

            throw new Error('The cache store is unreachable.');
        }

        return super.invalidate(tags);
    }
}

function createTaggedCache(driver: ICacheDriver = new MemoryCacheDriver({ maxTtl: TTL })): TaggedCache {
    return new TaggedCache({
        driver,
        ttl: TTL,
        onError: () => {},
    });
}

/** A read that counts its calls and answers the current value. */
function createRead<T>(initial: T) {
    const state = { calls: 0, value: initial };

    return {
        state,
        read: async () => {
            state.calls++;

            return state.value;
        },
    };
}

// Never initialized: no read here touches a connection, and a pooled
// driver decides the transaction check by the manager's own runner.
function createDataSource(): DataSource {
    return new DataSource({ type: 'postgres' });
}

describe('src/query-cache', () => {
    it('should read every time without a cache', async () => {
        const cache = new QueryCache({
            dataSource: createDataSource(), 
            registry, 
        });
        const { state, read } = createRead('value');

        await cache.remember('k', () => ['item'], read);
        await cache.remember('k', () => ['item'], read);

        expect(state.calls).toEqual(2);
        expect(cache.createSubscriber({ resolveSchemaName: () => 'item' })).toBeUndefined();
    });

    it('should answer a second read from the cache until a tag it carries is bumped', async () => {
        const tagged = createTaggedCache();
        const cache = new QueryCache({
            dataSource: createDataSource(), 
            registry, 
            cache: tagged, 
        });
        const { state, read } = createRead('value');

        await cache.remember('k', () => [buildCollectionTag('item')], read);
        await cache.remember('k', () => [buildCollectionTag('item')], read);
        expect(state.calls).toEqual(1);

        await tagged.invalidate([buildCollectionTag('other')]);
        await cache.remember('k', () => [buildCollectionTag('item')], read);
        expect(state.calls).toEqual(1);

        await tagged.invalidate([buildCollectionTag('item')]);
        await cache.remember('k', () => [buildCollectionTag('item')], read);
        expect(state.calls).toEqual(2);
    });

    it('should scope a query on a case-sensitive index-leading column to its value', async () => {
        const tagged = createTaggedCache();
        const cache = new QueryCache({
            dataSource: createDataSource(), 
            registry, 
            cache: tagged, 
        });
        const owner = 'a1b2c3d4-0000-4000-8000-00000000000a';
        const row: Item = {
            id: 'b1b2c3d4-0000-4000-8000-00000000000b', 
            ownerId: owner, 
            name: 'one', 
        };
        const { state, read } = createRead<Item | null>(row);
        const input = {
            key: `item/ownerId=${owner}`,
            query: defineQuery<Item>({ filters: { ownerId: owner.toUpperCase() } }),
            schema: 'item',
            caseSensitive: ['ownerId'],
        };

        await cache.rememberQuery(input, read);
        await cache.rememberQuery(input, read);
        expect(state.calls).toEqual(1);

        // the collection is not among its tags: a write elsewhere leaves it.
        await tagged.invalidate([buildCollectionTag('item'), buildScopedTag('item', 'ownerId', 'c1b2c3d4-0000-4000-8000-00000000000c')]);
        await cache.rememberQuery(input, read);
        expect(state.calls).toEqual(1);

        // the filter value was spelled through the shared normalizer.
        await tagged.invalidate([buildScopedTag('item', 'ownerId', owner)]);
        await cache.rememberQuery(input, read);
        expect(state.calls).toEqual(2);

        await tagged.invalidate([buildRecordTag('item', row.id)]);
        await cache.rememberQuery(input, read);
        expect(state.calls).toEqual(3);
    });

    it('should add the extra tags of a query read', async () => {
        const tagged = createTaggedCache();
        const cache = new QueryCache({
            dataSource: createDataSource(), 
            registry, 
            cache: tagged, 
        });
        const { state, read } = createRead<Item | null>(null);
        const input = {
            key: 'item/ownerId=x',
            query: defineQuery<Item>({ filters: { ownerId: 'a1b2c3d4-0000-4000-8000-00000000000a' } }),
            schema: 'item',
            caseSensitive: ['ownerId'],
            tags: () => [buildCollectionTag('other')],
        };

        await cache.rememberQuery(input, read);
        await cache.rememberQuery(input, read);
        expect(state.calls).toEqual(1);

        await tagged.invalidate([buildCollectionTag('other')]);
        await cache.rememberQuery(input, read);
        expect(state.calls).toEqual(2);
    });

    it('should build a subscriber over its tagged cache', () => {
        const cache = new QueryCache({
            dataSource: createDataSource(), 
            registry, 
            cache: createTaggedCache(), 
        });

        expect(cache.createSubscriber({ resolveSchemaName: () => 'item' })).toBeInstanceOf(CacheInvalidationSubscriber);
    });
});

describe('src/query-cache after a lost invalidation', () => {
    let driver: FailingCacheDriver;
    let tagged: TaggedCache;
    let cache: QueryCache;

    beforeEach(() => {
        driver = new FailingCacheDriver({ maxTtl: TTL });
        tagged = createTaggedCache(driver);
        cache = new QueryCache({
            dataSource: createDataSource(),
            registry,
            cache: tagged,
        });
    });

    afterEach(() => {
        tagged.dispose();
    });

    it('should keep the tags of a failed invalidation pending', async () => {
        driver.failures = 1;
        await expect(tagged.invalidate(['item'])).rejects.toThrow(CacheError);
        expect(tagged.pendingInvalidations).toEqual(['item']);

        await tagged.invalidate(['other']);
        expect(tagged.pendingInvalidations).toEqual([]);
    });

    it('should not serve the entry a lost bump left behind', async () => {
        const { state, read } = createRead('old');

        expect(await cache.remember('s', () => ['item'], read)).toEqual('old');
        expect(await cache.remember('s', () => ['item'], read)).toEqual('old');
        expect(state.calls).toEqual(1);

        state.value = 'new';
        driver.failures = 1;
        await expect(tagged.invalidate(['item'])).rejects.toThrow();

        expect(await cache.remember('s', () => ['item'], read)).toEqual('new');
        expect(await cache.rememberQuery({
            key: 'q',
            query: defineQuery({}),
            schema: 'item',
            tags: () => ['item'],
        }, read)).toEqual('new');
        expect(state.calls).toEqual(3);
    });

    it('should not serve a fill that was in flight when the bump was lost', async () => {
        const pending = Promise.withResolvers<string>();

        const inFlight = cache.remember('f', () => ['item'], () => pending.promise);

        driver.failures = 1;
        await expect(tagged.invalidate(['item'])).rejects.toThrow();

        pending.resolve('old');
        expect(await inFlight).toEqual('old');

        const { read } = createRead('new');

        expect(await cache.remember('f', () => ['item'], read)).toEqual('new');
    });

    it('should cache again once the pending bump is replayed', async () => {
        const { state, read } = createRead('value');

        driver.failures = 1;
        await expect(tagged.invalidate(['item'])).rejects.toThrow();

        await cache.remember('e', () => ['item'], read);
        await cache.remember('e', () => ['item'], read);
        expect(state.calls).toEqual(2);

        // the next successful driver call replays the pending tag.
        await tagged.invalidate(['other']);

        await cache.remember('e', () => ['item'], read);
        await cache.remember('e', () => ['item'], read);
        expect(state.calls).toEqual(3);
    });
});
