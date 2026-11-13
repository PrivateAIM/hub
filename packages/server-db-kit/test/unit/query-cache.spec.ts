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
    vi,
} from 'vitest';
import type { ITaggedCache } from '@rapiq/cache';
import {
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

type FailingTaggedCache = {
    cache: ITaggedCache,
    /** How many of the next invalidations reject without bumping. */
    fail: (count?: number) => void,
};

function createTaggedCache(): ITaggedCache {
    return new TaggedCache({
        driver: new MemoryCacheDriver({ maxTtl: TTL }),
        ttl: TTL,
        onError: () => {},
    });
}

function createFailingTaggedCache(): FailingTaggedCache {
    const cache = createTaggedCache();
    let failures = 0;

    return {
        cache: {
            remember: (key, read, options) => cache.remember(key, read, options),
            invalidate: (tags) => {
                if (failures > 0) {
                    failures--;

                    return Promise.reject(new Error('The cache store is unreachable.'));
                }

                return cache.invalidate(tags);
            },
            drop: (keys) => cache.drop(keys),
        },
        fail: (count = 1) => {
            failures = count;
        },
    };
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
            ttl: TTL, 
        });
        const { state, read } = createRead('value');

        await cache.remember('k', () => ['item'], read);
        await cache.remember('k', () => ['item'], read);

        expect(state.calls).toEqual(2);
        expect(cache.createSubscriber({ resolveSchemaName: () => 'item' })).toBeUndefined();
    });

    it('should answer a second read from the cache until a tag it carries is bumped', async () => {
        const cache = new QueryCache({
            dataSource: createDataSource(), 
            registry, 
            ttl: TTL, 
            cache: createTaggedCache(), 
        });
        const invalidator = cache.createInvalidator();
        const { state, read } = createRead('value');

        await cache.remember('k', () => [buildCollectionTag('item')], read);
        await cache.remember('k', () => [buildCollectionTag('item')], read);
        expect(state.calls).toEqual(1);

        await invalidator.invalidate([buildCollectionTag('other')]);
        await cache.remember('k', () => [buildCollectionTag('item')], read);
        expect(state.calls).toEqual(1);

        await invalidator.invalidate([buildCollectionTag('item')]);
        await cache.remember('k', () => [buildCollectionTag('item')], read);
        expect(state.calls).toEqual(2);
    });

    it('should scope a query on a case-sensitive index-leading column to its value', async () => {
        const cache = new QueryCache({
            dataSource: createDataSource(), 
            registry, 
            ttl: TTL, 
            cache: createTaggedCache(), 
        });
        const invalidator = cache.createInvalidator();
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
        await invalidator.invalidate([buildCollectionTag('item'), buildScopedTag('item', 'ownerId', 'c1b2c3d4-0000-4000-8000-00000000000c')]);
        await cache.rememberQuery(input, read);
        expect(state.calls).toEqual(1);

        // the filter value was spelled through the shared normalizer.
        await invalidator.invalidate([buildScopedTag('item', 'ownerId', owner)]);
        await cache.rememberQuery(input, read);
        expect(state.calls).toEqual(2);

        await invalidator.invalidate([buildRecordTag('item', row.id)]);
        await cache.rememberQuery(input, read);
        expect(state.calls).toEqual(3);
    });

    it('should add the extra tags of a query read', async () => {
        const cache = new QueryCache({
            dataSource: createDataSource(), 
            registry, 
            ttl: TTL, 
            cache: createTaggedCache(), 
        });
        const invalidator = cache.createInvalidator();
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

        await invalidator.invalidate([buildCollectionTag('other')]);
        await cache.rememberQuery(input, read);
        expect(state.calls).toEqual(2);
    });

    it('should build a subscriber over its own invalidator', () => {
        const cache = new QueryCache({
            dataSource: createDataSource(), 
            registry, 
            ttl: TTL, 
            cache: createTaggedCache(), 
        });

        expect(cache.createSubscriber({ resolveSchemaName: () => 'item' })).toBeInstanceOf(CacheInvalidationSubscriber);
    });
});

describe('src/query-cache suspension after a lost invalidation', () => {
    let tagged: FailingTaggedCache;
    let cache: QueryCache;
    let invalidator: ReturnType<QueryCache['createInvalidator']>;

    beforeEach(() => {
        // only Date: the store's expiry and the suspension window read the same clock.
        vi.useFakeTimers({ toFake: ['Date'] });

        tagged = createFailingTaggedCache();
        cache = new QueryCache({
            dataSource: createDataSource(),
            registry,
            ttl: TTL,
            cache: tagged.cache,
        });
        invalidator = cache.createInvalidator();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function advance(ms: number) {
        vi.setSystemTime(Date.now() + ms);
    }

    it('should read past the cache for one ttl after a failed invalidation', async () => {
        const { state, read } = createRead('value');

        await cache.remember('k', () => ['item'], read);
        await cache.remember('k', () => ['item'], read);
        expect(state.calls).toEqual(1);

        tagged.fail();
        await expect(invalidator.invalidate(['item'])).rejects.toThrow('The cache store is unreachable.');

        await cache.remember('k', () => ['item'], read);
        await cache.rememberQuery({
            key: 'q', 
            query: defineQuery({}), 
            schema: 'item', 
        }, read);
        expect(state.calls).toEqual(3);

        advance(TTL - 1);

        await cache.remember('k', () => ['item'], read);
        expect(state.calls).toEqual(4);

        advance(1);

        await cache.remember('k', () => ['item'], read);
        await cache.remember('k', () => ['item'], read);
        expect(state.calls).toEqual(5);
    });

    it('should not serve the entry a lost bump left behind', async () => {
        const { state, read } = createRead('old');

        expect(await cache.remember('s', () => ['item'], read)).toEqual('old');

        state.value = 'new';
        tagged.fail();
        await expect(invalidator.invalidate(['item'])).rejects.toThrow();

        // the store still holds the old entry under an unbumped tag.
        expect(await tagged.cache.remember('s', read, { tags: () => ['item'] })).toEqual('old');

        expect(await cache.remember('s', () => ['item'], read)).toEqual('new');
    });

    it('should not serve a fill that was in flight when the bump was lost', async () => {
        const pending = Promise.withResolvers<string>();

        const inFlight = cache.remember('f', () => ['item'], () => pending.promise);

        tagged.fail();
        await expect(invalidator.invalidate(['item'])).rejects.toThrow();

        // the read finishes after the failure and is stored with a full ttl.
        advance(10);
        pending.resolve('old');
        expect(await inFlight).toEqual('old');

        advance(TTL - 10);

        const { read } = createRead('new');

        expect(await cache.remember('f', () => ['item'], read)).toEqual('new');
    });

    it('should extend the suspension on a second failure', async () => {
        const { state, read } = createRead('value');

        tagged.fail();
        await expect(invalidator.invalidate(['item'])).rejects.toThrow();

        advance(TTL / 2);

        tagged.fail();
        await expect(invalidator.invalidate(['item'])).rejects.toThrow();

        advance(TTL / 2);

        await cache.remember('e', () => ['item'], read);
        await cache.remember('e', () => ['item'], read);
        expect(state.calls).toEqual(2);

        advance(TTL / 2);

        await cache.remember('e', () => ['item'], read);
        await cache.remember('e', () => ['item'], read);
        expect(state.calls).toEqual(3);
    });

    it('should not suspend after a successful invalidation', async () => {
        const { state, read } = createRead('value');

        await invalidator.invalidate(['item']);

        await cache.remember('o', () => ['item'], read);
        await cache.remember('o', () => ['item'], read);
        expect(state.calls).toEqual(1);
    });
});
