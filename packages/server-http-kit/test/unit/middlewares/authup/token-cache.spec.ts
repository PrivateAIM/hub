/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryTokenCache } from '@authup/server-adapter-kit';
import { RedisTokenCache } from '@authup/server-adapter-redis';
import { createClient } from 'redis-extension';
import {
    describe,
    expect,
    it,
} from 'vitest';
import { createAuthupTokenCache } from '../../../../src/middlewares/authup/token-cache.ts';

describe('createAuthupTokenCache', () => {
    it('should fall back to process memory without redis', () => {
        const { cache, dispose } = createAuthupTokenCache();

        expect(cache).toBeInstanceOf(MemoryTokenCache);
        expect(() => dispose()).not.toThrow();
    });

    it('should run on a bounded duplicate and leave the source untouched', async () => {
        // nothing listens on port 1: every connection attempt is refused.
        const source = createClient({
            url: 'redis://127.0.0.1:1',
            options: { lazyConnect: true },
        });

        const errors: Error[] = [];
        const { cache, dispose } = createAuthupTokenCache({
            redis: source,
            onError: (error) => {
                errors.push(error);
            },
        });

        try {
            expect(cache).toBeInstanceOf(RedisTokenCache);

            // no offline queue: an outage falls through at once, it never queues.
            const startedAt = Date.now();

            await expect(cache.get('key')).resolves.toBeUndefined();
            expect(Date.now() - startedAt).toBeLessThan(1000);

            await expect.poll(() => errors.length).toBeGreaterThan(0);

            expect(source.status).toEqual('wait');
        } finally {
            dispose();
            source.disconnect();
        }
    });
});
