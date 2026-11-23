/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'eldin';
import { describe, expect, it } from 'vitest';
import {
    LoggerInjectionKey,
    LoggerMemoryTransport,
    RedisClientInjectionKey,
    TAGGED_CACHE_CONNECT_TIMEOUT,
    TAGGED_CACHE_ERROR_LOG_INTERVAL,
    TAGGED_CACHE_MODULE_NAME,
    TAGGED_CACHE_TTL,
    TaggedCacheInjectionKey,
    TaggedCacheModule,
    createLogger,
    createRedisClient,
    createTaggedCache,
    createTaggedCacheClient,
    throttle,
} from '../../../src';

// port 1 refuses every connection, so no spec needs a running Redis.
const UNREACHABLE_REDIS_URL = 'redis://127.0.0.1:1';

function createSourceClient(keyPrefix?: string) {
    return createRedisClient({
        url: UNREACHABLE_REDIS_URL,
        options: { lazyConnect: true, keyPrefix },
    });
}

function createErrorRecorder() {
    const errors: unknown[] = [];

    return {
        errors,
        onError: (error: unknown) => {
            errors.push(error); 
        }, 
    };
}

describe('src/cache', () => {
    it('should export the fixed contract values', () => {
        expect(TAGGED_CACHE_TTL).toEqual(60_000);
        expect(TAGGED_CACHE_ERROR_LOG_INTERVAL).toEqual(10_000);
        expect(typeof TAGGED_CACHE_MODULE_NAME).toEqual('string');
    });

    it('should serve a remembered value again and drop it by its tag on the memory driver', async () => {
        const { onError } = createErrorRecorder();
        const { cache, dispose } = createTaggedCache({ prefix: 'hub-core', onError });
        let reads = 0;
        const read = async () => {
            reads++;

            return { id: 'a' };
        };

        await expect(cache.remember('k', read, { tags: () => ['t'] })).resolves.toEqual({ id: 'a' });
        await expect(cache.remember('k', read, { tags: () => ['t'] })).resolves.toEqual({ id: 'a' });
        expect(reads).toEqual(1);

        await cache.invalidate(['t']);

        await cache.remember('k', read, { tags: () => ['t'] });
        expect(reads).toEqual(2);

        await dispose();
    });

    it('should fold the source keyPrefix into the driver prefix and give the driver client none', () => {
        const cases: [string | undefined, string][] = [
            ['b:', 'b:hub-core'],
            ['', 'hub-core'],
            [undefined, 'hub-core'],
        ];

        for (const [keyPrefix, expected] of cases) {
            const source = createSourceClient(keyPrefix);
            const sourceKeyPrefix = source.options.keyPrefix;
            const { client, prefix } = createTaggedCacheClient(source, 'hub-core');

            expect(prefix).toEqual(expected);
            expect(client).not.toBe(source);
            expect(client.options.keyPrefix).toBeFalsy();
            expect(source.options.keyPrefix).toEqual(sourceKeyPrefix);

            client.disconnect();
            source.disconnect();
        }
    });

    it('should duplicate the client with fail-fast options', () => {
        const source = createSourceClient();
        const { client } = createTaggedCacheClient(source, 'hub-core');
        const { options } = client;

        expect(options.maxRetriesPerRequest).toEqual(1);
        expect(options.enableOfflineQueue).toBe(false);
        expect(options.commandTimeout).toEqual(500);
        expect(options.lazyConnect).toBe(true);
        expect(options.port).toEqual(1);
        expect(options.retryStrategy?.(1)).toEqual(50);
        expect(options.retryStrategy?.(1_000)).toEqual(2_000);
        expect(client.status).toEqual('wait');

        client.disconnect();
        source.disconnect();
    });

    it('should leave the service client untouched on dispose', async () => {
        const source = createSourceClient('x:');
        const { status } = source;
        const { onError } = createErrorRecorder();
        const { dispose } = createTaggedCache({
            redis: source, 
            prefix: 'hub-core', 
            onError, 
        });

        await expect(dispose()).resolves.toBeUndefined();

        expect(source.status).toEqual(status);
        expect(source.options.keyPrefix).toEqual('x:');

        source.disconnect();
    });

    it('should fall through to the read quickly when redis is unreachable', async () => {
        const source = createSourceClient();
        const { errors, onError } = createErrorRecorder();
        const { cache, dispose } = createTaggedCache({
            redis: source, 
            prefix: 'hub-core', 
            onError, 
        });

        const startedAt = Date.now();
        const value = await cache.remember('k', async () => 'value', { tags: () => ['t'] });

        expect(value).toEqual('value');
        expect(Date.now() - startedAt).toBeLessThan(2_000);
        expect(errors.length).toBeGreaterThan(0);

        await dispose();
        source.disconnect();
    });

    it('should bound ready() by the connect timeout against a refused redis and never reject', async () => {
        const source = createSourceClient();
        const { errors, onError } = createErrorRecorder();
        const { ready, dispose } = createTaggedCache({
            redis: source, 
            prefix: 'hub-core', 
            onError, 
        });

        const startedAt = Date.now();

        await expect(ready()).resolves.toBeUndefined();

        const elapsed = Date.now() - startedAt;

        expect(elapsed).toBeGreaterThanOrEqual(TAGGED_CACHE_CONNECT_TIMEOUT - 50);
        expect(elapsed).toBeLessThan(TAGGED_CACHE_CONNECT_TIMEOUT + 1_000);
        expect(errors.length).toBeGreaterThan(0);

        await dispose();
        source.disconnect();
    });

    it('should settle ready() at once for a disposed client', async () => {
        const source = createSourceClient();
        const { onError } = createErrorRecorder();
        const { ready, dispose } = createTaggedCache({
            redis: source, 
            prefix: 'hub-core', 
            onError, 
        });

        await dispose();

        const startedAt = Date.now();

        await expect(ready()).resolves.toBeUndefined();
        expect(Date.now() - startedAt).toBeLessThan(TAGGED_CACHE_CONNECT_TIMEOUT);

        source.disconnect();
    });

    it('should register a memory cache without redis and unregister it on teardown', async () => {
        const container = new Container();
        const module = new TaggedCacheModule({ prefix: 'hub-core' });

        expect(module.name).toEqual(TAGGED_CACHE_MODULE_NAME);

        await module.setup(container);

        const cache = container.resolve(TaggedCacheInjectionKey);

        await expect(cache.remember('k', async () => 'value', { tags: () => ['t'] })).resolves.toEqual('value');

        await module.teardown(container);

        expect(container.has(TaggedCacheInjectionKey)).toBe(false);
    });

    it('should use the registered redis client, and dispose only its duplicate on teardown', async () => {
        const source = createSourceClient();
        const { status } = source;
        const container = new Container();

        container.register(RedisClientInjectionKey, { useValue: source });

        const module = new TaggedCacheModule({ prefix: 'hub-core' });

        await module.setup(container);

        expect(container.has(TaggedCacheInjectionKey)).toBe(true);

        await module.teardown(container);

        expect(container.has(TaggedCacheInjectionKey)).toBe(false);
        expect(source.status).toEqual(status);

        source.disconnect();
    });

    it('should log one warn line for repeated failures', async () => {
        const source = createSourceClient();
        const transport = new LoggerMemoryTransport();
        const container = new Container();

        container.register(RedisClientInjectionKey, { useValue: source });
        container.register(LoggerInjectionKey, { useValue: createLogger({ transports: [transport] }) });

        const module = new TaggedCacheModule({ prefix: 'hub-core' });

        await module.setup(container);

        const cache = container.resolve(TaggedCacheInjectionKey);

        await cache.remember('k', async () => 'value', { tags: () => ['t'] });
        await cache.remember('k', async () => 'value', { tags: () => ['t'] });

        await module.teardown(container);
        source.disconnect();

        const lines = transport.items.filter((item) => item.level === 'warn');

        expect(lines).toHaveLength(1);
        expect(lines[0].message).toMatch(/^The tagged cache failed: /);
    });

    it('should throttle to one call per window and call again after it', () => {
        let time = 0;
        const calls: string[] = [];
        const throttled = throttle((value: string) => {
            calls.push(value); 
        }, 10_000, () => time);

        throttled('a');
        throttled('b');
        time = 9_999;
        throttled('c');
        expect(calls).toEqual(['a']);

        time = 10_000;
        throttled('d');
        throttled('e');
        expect(calls).toEqual(['a', 'd']);
    });

    it('should keep separate windows for two throttles', () => {
        const a: number[] = [];
        const b: number[] = [];
        const throttledA = throttle(() => {
            a.push(1); 
        }, 10_000, () => 0);
        const throttledB = throttle(() => {
            b.push(1); 
        }, 10_000, () => 0);

        throttledA();
        throttledB();
        throttledA();

        expect(a).toHaveLength(1);
        expect(b).toHaveLength(1);
    });
});
