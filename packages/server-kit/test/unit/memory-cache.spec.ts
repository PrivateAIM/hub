/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryCache } from '../../src';

describe('memory-cache', () => {
    it('should support operations (set,get,has,del)', () => {
        const cache = new MemoryCache();
        cache.set('foo', { bar: 'baz' }, {
            ttl: 1000 * 60 * 15,
        });

        expect(cache.has('foo')).toBeTruthy();

        let value = cache.get('foo');
        expect(value).toEqual({ bar: 'baz' });

        cache.del('foo');

        expect(cache.has('foo')).toBeFalsy();

        value = cache.get('foo');
        expect(value).toBeUndefined();
    });
});
