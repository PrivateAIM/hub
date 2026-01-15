/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import { Cache, MemoryCacheAdapter } from '../../src';

describe('memory-cache', () => {
    it('should support operations (set,get,has,del)', async () => {
        const adapter = new MemoryCacheAdapter();
        const cache = new Cache(adapter);
        await cache.set('foo', { bar: 'baz' }, {
            ttl: 1000 * 60 * 15,
        });

        expect(await cache.has('foo')).toBeTruthy();

        let value = await cache.get('foo');
        expect(value).toEqual({ bar: 'baz' });

        await cache.drop('foo');

        expect(await cache.has('foo')).toBeFalsy();

        value = await cache.get('foo');
        expect(value).toBeUndefined();
    });
});
