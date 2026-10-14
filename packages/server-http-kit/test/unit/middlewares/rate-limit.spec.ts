/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { App, defineCoreHandler } from 'routup';
import { describe, expect, it } from 'vitest';
import { mountRateLimiterMiddleware } from '../../../src/middlewares/rate-limit.ts';
import type { RequestIdentity } from '../../../src/request/index.ts';
import { setRequestIdentity } from '../../../src/request/index.ts';

async function limitFor(identity?: Pick<RequestIdentity, 'type' | 'realmName'>): Promise<string | null> {
    const app = new App();
    app.use(defineCoreHandler((event) => {
        if (identity) {
            setRequestIdentity(event, {
                id: 'a', 
                realmId: 'b', 
                ...identity,
            });
        }
        return event.next();
    }));
    mountRateLimiterMiddleware(app);
    app.get('/', defineCoreHandler(() => ({})));

    const response = await app.fetch(new Request('http://hub.test/'));
    expect(response.status).toBe(200);
    return response.headers.get('ratelimit-limit');
}

describe('rate limiter', () => {
    it('skips a master-realm client', async () => {
        expect(await limitFor({ type: 'client', realmName: 'master' })).toBeNull();
    });

    it('limits a client outside the master realm', async () => {
        expect(await limitFor({ type: 'client', realmName: 'other' })).toBe(String(60 * 1000));
    });

    it('limits a master-realm user', async () => {
        expect(await limitFor({ type: 'user', realmName: 'master' })).toBe(String(60 * 100));
    });

    it('limits an anonymous request', async () => {
        expect(await limitFor()).toBe(String(60 * 20));
    });
});
