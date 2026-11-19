/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { PermissionCompileContext, PermissionCompileResult } from '@authup/access';
import { PermissionName } from '@privateaim/kit';
import { FakePermissionEvaluator } from '@authup/server-test-kit';
import { HubError } from '@privateaim/errors';
import { App, defineCoreHandler } from 'routup';
import { toNodeHandler } from 'routup/node';
import { describe, expect, it } from 'vitest';
import { mountErrorMiddleware } from '../../../src/middlewares/error.ts';
import {
    RATE_LIMIT_FAILED_AUTHENTICATION_MAX,
    mountAuthenticationRateLimiterMiddleware,
    mountRateLimiterMiddleware,
} from '../../../src/middlewares/rate-limit.ts';
import type { RequestIdentity } from '../../../src/request/index.ts';
import { setRequestEnv, setRequestIdentity } from '../../../src/request/index.ts';

async function limitFor(
    identity?: Pick<RequestIdentity, 'type'>,
    compiled?: PermissionCompileResult | FakePermissionEvaluator,
): Promise<string | null> {
    const app = new App();

    app.use(defineCoreHandler((event) => {
        if (identity) {
            setRequestIdentity(event, {
                id: 'a',
                realmId: 'b',
                realmName: 'master',
                ...identity,
            });
        }

        if (compiled instanceof FakePermissionEvaluator) {
            setRequestEnv(event, 'permissionEvaluator', compiled);
        } else if (compiled) {
            const evaluator = new FakePermissionEvaluator();

            evaluator.setCompileResult(compiled);
            setRequestEnv(event, 'permissionEvaluator', evaluator);
        }

        return event.next();
    }));
    mountRateLimiterMiddleware(app);
    app.get('/', defineCoreHandler(() => ({})));

    const response = await app.fetch(new Request('http://hub.test/'));

    expect(response.status).toBe(200);

    return response.headers.get('ratelimit-limit');
}

/** `allow` for every name except the given ones. */
class AllowAllButEvaluator extends FakePermissionEvaluator {
    constructor(protected excluded: string[]) {
        super();
    }

    override async compile(ctx: PermissionCompileContext): Promise<PermissionCompileResult> {
        const names = Array.isArray(ctx.name) ? ctx.name : [ctx.name];
        const { excluded } = this;

        const allowed = names.some((name) => !excluded.includes(name));

        return { verdict: allowed ? 'allow' : 'deny' };
    }
}

describe('rate limiter', () => {
    it('skips a client whose grant reaches every realm', async () => {
        expect(await limitFor({ type: 'client' }, { verdict: 'allow' })).toBeNull();
    });

    it('limits a client whose grants are realm-bound, even in the master realm', async () => {
        expect(await limitFor({ type: 'client' }, { verdict: 'post' })).toBe(String(60 * 1000));
    });

    it('limits a client whose unbounded reach covers only some permissions', async () => {
        const evaluator = new AllowAllButEvaluator([PermissionName.ANALYSIS_UPDATE]);

        expect(await limitFor({ type: 'client' }, evaluator)).toBe(String(60 * 1000));
    });

    it('limits a client without an evaluator', async () => {
        expect(await limitFor({ type: 'client' })).toBe(String(60 * 1000));
    });

    it('limits a user with unbounded reach', async () => {
        expect(await limitFor({ type: 'user' }, { verdict: 'allow' })).toBe(String(60 * 100));
    });

    it('limits an anonymous request', async () => {
        expect(await limitFor()).toBe(String(60 * 20));
    });

    it('counts users behind one address against their own budgets', async () => {
        const app = new App();

        app.use(defineCoreHandler((event) => {
            setRequestIdentity(event, {
                id: event.headers.get('x-user') || 'a',
                type: 'user',
                realmId: 'b',
                realmName: 'master',
            });

            return event.next();
        }));
        mountRateLimiterMiddleware(app);
        app.get('/', defineCoreHandler(() => ({})));

        const send = (user: string) => app.fetch(new Request('http://hub.test/', { headers: { 'x-user': user, 'x-forwarded-for': '203.0.113.7' } }));

        await send('alice');
        await send('alice');

        const bob = await send('bob');

        expect(bob.headers.get('ratelimit-remaining')).toBe(String(60 * 100 - 1));
    });
});

describe('authentication rate limiter', () => {
    function createApp(code = 'invalid_token') {
        const app = new App();

        mountAuthenticationRateLimiterMiddleware(app);
        app.get('/fail', defineCoreHandler(() => {
            throw new HubError({
                code, 
                status: 401, 
                message: 'refused', 
            });
        }));
        app.get('/ok', defineCoreHandler(() => ({})));
        mountErrorMiddleware(app);

        return app;
    }

    function send(app: App, path: string, headers: Record<string, string> = {}) {
        return app.fetch(new Request(`http://hub.test${path}`, { headers: { 'x-forwarded-for': '203.0.113.7', ...headers } }));
    }

    async function remainingAfter(app: App, path: string, headers: Record<string, string> = {}) {
        await send(app, path, headers);

        const probe = await send(app, '/ok');

        return Number(probe.headers.get('ratelimit-remaining'));
    }

    it('counts a refused bearer against its address', async () => {
        const app = createApp();

        expect(await remainingAfter(app, '/fail', { authorization: 'Bearer forged' }))
            .toBe(RATE_LIMIT_FAILED_AUTHENTICATION_MAX - 1);
    });

    it('does not count an expired token', async () => {
        const app = createApp('expired_token');

        expect(await remainingAfter(app, '/fail', { authorization: 'Bearer expired' }))
            .toBe(RATE_LIMIT_FAILED_AUTHENTICATION_MAX);
    });

    it('does not count a 401 without a credential', async () => {
        const app = createApp();

        expect(await remainingAfter(app, '/fail')).toBe(RATE_LIMIT_FAILED_AUTHENTICATION_MAX);
    });

    it('does not count a successful request', async () => {
        const app = createApp();

        expect(await remainingAfter(app, '/ok')).toBe(RATE_LIMIT_FAILED_AUTHENTICATION_MAX);
    });

    it('limits traffic a reverse proxy on the same host forwards over loopback', async () => {
        // With TRUST_PROXY=false every request of a local proxy has a
        // loopback socket and trusted address; it must still be counted.
        const app = new App({ options: { trustProxy: false } });

        mountAuthenticationRateLimiterMiddleware(app);
        mountRateLimiterMiddleware(app);
        app.get('/', defineCoreHandler(() => ({})));

        const server = createServer(toNodeHandler(app));

        await new Promise<void>((resolve) => {
            server.listen(0, '127.0.0.1', resolve);
        });

        try {
            const { port } = server.address() as AddressInfo;
            const response = await fetch(`http://127.0.0.1:${port}/`);

            expect(response.headers.get('ratelimit-limit')).toBe(String(60 * 20));
        } finally {
            await new Promise((resolve) => {
                server.close(resolve);
            });
        }
    });
});
