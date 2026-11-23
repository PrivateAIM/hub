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
import { mountMiddlewares } from '../../../src/middlewares/module.ts';
import type { MiddlewareMountOptions } from '../../../src/middlewares/types.ts';
import {
    RATE_LIMIT_FAILED_AUTHENTICATION_MAX,
    isAddressKeyTrusted,
    mountAuthenticationRateLimiterMiddleware,
    mountRateLimiterMiddleware,
} from '../../../src/middlewares/rate-limit.ts';
import type { RequestCapability, RequestIdentity } from '../../../src/request/index.ts';
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

function buildCapability(subject: Pick<RequestCapability['subject'], 'id' | 'type'>): RequestCapability {
    const issuedAt = Math.floor(Date.now() / 1000);

    return {
        subject: { realmId: 'b', ...subject },
        entries: [{
            type: 'bucket', 
            id: 'c', 
            actions: ['read'], 
        }],
        issuedAt,
        expiresAt: issuedAt + 60,
        source: 'header',
    };
}

describe('rate limiter with a capability request', () => {
    function createApp() {
        const app = new App();

        app.use(defineCoreHandler((event) => {
            const capability = event.headers.get('x-capability');
            const identity = event.headers.get('x-identity');

            if (capability) {
                setRequestEnv(event, 'capability', buildCapability({
                    id: capability,
                    type: (event.headers.get('x-type') || 'client') as 'user' | 'client',
                }));
            }

            if (identity) {
                setRequestIdentity(event, {
                    id: identity,
                    type: 'client',
                    realmId: 'b',
                    realmName: 'master',
                });
            }

            return event.next();
        }));
        mountRateLimiterMiddleware(app);
        app.get('/', defineCoreHandler(() => ({})));

        return app;
    }

    const send = (app: App, headers: Record<string, string>) => app.fetch(new Request('http://hub.test/', { headers: { 'x-forwarded-for': '203.0.113.7', ...headers } }));

    it('limits a client subject with the client budget', async () => {
        const response = await send(createApp(), { 'x-capability': 'node' });

        expect(response.headers.get('ratelimit-limit')).toBe(String(60 * 1000));
    });

    it('limits a user subject with the user budget', async () => {
        const response = await send(createApp(), { 'x-capability': 'alice', 'x-type': 'user' });

        expect(response.headers.get('ratelimit-limit')).toBe(String(60 * 100));
    });

    it('counts against the subject, not the address', async () => {
        const app = createApp();

        await send(app, {});
        await send(app, {});

        const node = await send(app, { 'x-capability': 'node' });

        expect(node.headers.get('ratelimit-remaining')).toBe(String(60 * 1000 - 1));
    });

    it('shares the budget of the subject\'s own login requests', async () => {
        const app = createApp();

        await send(app, { 'x-identity': 'node' });

        const capability = await send(app, { 'x-capability': 'node' });

        expect(capability.headers.get('ratelimit-remaining')).toBe(String(60 * 1000 - 2));
    });
});

describe('authentication rate limiter', () => {
    function createApp(code = 'invalid_token', gate?: Promise<void>) {
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
        app.get('/slow', defineCoreHandler(async () => {
            await gate;

            return {};
        }));
        mountErrorMiddleware(app);

        return app;
    }

    function send(app: App, path: string, headers: Record<string, string> = {}) {
        return app.fetch(new Request(`http://hub.test${path}`, { headers: { 'x-forwarded-for': '203.0.113.7', ...headers } }));
    }

    async function repeat(app: App, path: string, headers: Record<string, string> = {}) {
        for (let i = 0; i < RATE_LIMIT_FAILED_AUTHENTICATION_MAX; i++) {
            await send(app, path, headers);
        }
    }

    it('blocks an address once its refused bearers reach the limit', async () => {
        const app = createApp();

        await repeat(app, '/fail', { authorization: 'Bearer forged' });

        const blocked = await send(app, '/ok', { authorization: 'Bearer valid' });

        expect(blocked.status).toBe(429);
        await expect(blocked.json()).resolves.toMatchObject({ code: 'throttled' });
        expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
    });

    it('does not count an expired token', async () => {
        const app = createApp('expired_token');

        await repeat(app, '/fail', { authorization: 'Bearer expired' });

        expect((await send(app, '/ok')).status).toBe(200);
    });

    it('does not count a 401 without a credential', async () => {
        const app = createApp();

        await repeat(app, '/fail');

        expect((await send(app, '/ok')).status).toBe(200);
    });

    it('does not let pending valid requests use the budget', async () => {
        const { promise: gate, resolve: release } = Promise.withResolvers<void>();
        const app = createApp('invalid_token', gate);

        const pending = Array.from(
            { length: RATE_LIMIT_FAILED_AUTHENTICATION_MAX + 10 },
            () => send(app, '/slow', { authorization: 'Bearer valid' }),
        );

        const response = await send(app, '/ok', { authorization: 'Bearer valid' });

        expect(response.status).toBe(200);

        release();
        await Promise.all(pending);
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

describe('failed-authentication stage gating', () => {
    function createApp(rateLimit: MiddlewareMountOptions['rateLimit']) {
        const app = new App();

        mountMiddlewares(app, { rateLimit });
        app.get('/fail', defineCoreHandler(() => {
            throw new HubError({
                code: 'invalid_token',
                status: 401,
                message: 'refused',
            });
        }));
        app.get('/ok', defineCoreHandler(() => ({})));
        mountErrorMiddleware(app);

        return app;
    }

    async function lockOut(app: App) {
        const headers = { authorization: 'Bearer forged', 'x-forwarded-for': '203.0.113.7' };

        for (let i = 0; i < RATE_LIMIT_FAILED_AUTHENTICATION_MAX; i++) {
            await app.fetch(new Request('http://hub.test/fail', { headers }));
        }

        return app.fetch(new Request('http://hub.test/ok', { headers: { ...headers, authorization: 'Bearer valid' } }));
    }

    it.each([
        [true],
        [{}],
        [{ trustProxy: true }],
        [{ trustProxy: ['0.0.0.0/0', '::/0'] }],
        [{ trustProxy: ['10.0.0.0/8', '0.0.0.0/0'] }],
    ])('does not block addresses a client can forge (%j)', async (rateLimit) => {
        expect((await lockOut(createApp(rateLimit))).status).toBe(200);
    });

    it.each([
        [{ trustProxy: false }],
        [{ trustProxy: 1 }],
        [{ trustProxy: ['10.0.0.0/8'] }],
    ])('blocks once TRUST_PROXY is narrowed (%j)', async (rateLimit) => {
        expect(isAddressKeyTrusted(rateLimit)).toBe(true);
        expect((await lockOut(createApp(rateLimit))).status).toBe(429);
    });
});
