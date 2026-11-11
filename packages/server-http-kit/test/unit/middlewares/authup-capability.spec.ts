/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthorizationCatalog } from '@authup/access';
import { Client } from '@authup/core-http-kit';
import type { ITokenVerifier, TokenVerificationData } from '@authup/server-adapter-kit';
import { UnauthorizedError } from '@privateaim/errors';
import { MemoryTransport } from 'hapic';
import type { IAppEvent } from 'routup';
import { App, defineCoreHandler } from 'routup';
import { describe, expect, it } from 'vitest';
import {
    ForceIdentityOrCapabilityMiddleware,
    ForceIdentityOrStreamCapabilityMiddleware,
    ForceLoggedInMiddleware,
    createAuthupCapabilityTokenVerifier,
    mountAuthorizationMiddleware,
    mountBasicMiddleware,
    mountErrorMiddleware,
} from '../../../src/middlewares/index.ts';
import { UnconfiguredTokenVerifier } from '../../../src/middlewares/authup/unconfigured-token-verifier.ts';
import type { AuthorizationMiddlewareRegistrationOptions } from '../../../src/middlewares/index.ts';
import {
    useRequestCapability,
    useRequestIdentity,
    useRequestToken,
} from '../../../src/request/index.ts';

const catalog: AuthorizationCatalog = { permissions: [], policies: {} };

const SUBJECT_ID = '00000000-0000-4000-8000-000000000001';
const REALM_ID = '00000000-0000-4000-8000-000000000002';
const BUCKET_ID = '00000000-0000-4000-8000-000000000003';

function base64url(input: string): string {
    return Buffer.from(input, 'utf8').toString('base64url');
}

/**
 * An unsigned compact JWS: the fake verifiers decide validity, the middleware
 * only peeks at the payload to route it.
 */
function buildToken(payload: Record<string, unknown>): string {
    return [
        base64url(JSON.stringify({ alg: 'none', typ: 'JWT' })),
        base64url(JSON.stringify(payload)),
        base64url('signature'),
    ].join('.');
}

const now = Math.floor(Date.now() / 1000);

function capabilityData(lifetime: number, extra: Partial<TokenVerificationData> = {}): TokenVerificationData {
    return {
        kind: 'capability_token',
        sub: SUBJECT_ID,
        sub_kind: 'user',
        realm_id: REALM_ID,
        realm_name: 'master',
        cap: [`bucket:${BUCKET_ID}:read`],
        act: { sub: 'analysis-client', sub_kind: 'client' },
        iat: now,
        exp: now + lifetime,
        permissions: [],
        ...extra,
    };
}

function accessData(extra: Partial<TokenVerificationData> = {}): TokenVerificationData {
    return {
        kind: 'access_token',
        sub: SUBJECT_ID,
        sub_kind: 'user',
        realm_id: REALM_ID,
        realm_name: 'master',
        scope: 'global',
        iat: now,
        exp: now + 3600,
        permissions: [],
        ...extra,
    };
}

/**
 * Answers canned results per token string; any other token is refused, as
 * a real verifier would refuse a token it cannot verify.
 */
class FakeTokenVerifier implements ITokenVerifier {
    protected results: Map<string, TokenVerificationData>;

    public readonly calls: string[] = [];

    constructor(results: Record<string, TokenVerificationData> = {}) {
        this.results = new Map(Object.entries(results));
    }

    async verify(token: string): Promise<TokenVerificationData> {
        this.calls.push(token);

        const result = this.results.get(token);

        if (!result) {
            throw new UnauthorizedError('The fake verifier does not know this token.');
        }

        return result;
    }
}

// Each token's payload names its kind, so the middleware routes it.
const HEADER_CAP = buildToken({ kind: 'capability_token', n: 1 });
const QUERY_CAP_60 = buildToken({ kind: 'capability_token', n: 2 });
const QUERY_CAP_61 = buildToken({ kind: 'capability_token', n: 3 });
const ACCESS = buildToken({ kind: 'access_token', n: 4 });
const ACCESS_NO_KIND = buildToken({ n: 5 });
const MALFORMED_CAP = buildToken({ kind: 'capability_token', n: 6 });
const CAP_NO_SUB_KIND = buildToken({ kind: 'capability_token', n: 7 });
const CAP_SERVICE_SUB_KIND = buildToken({ kind: 'capability_token', n: 8 });
const CAP_NO_CAP = buildToken({ kind: 'capability_token', n: 9 });
const CAP_AS_ACCESS = buildToken({ n: 10 });

function createCapabilityVerifier() {
    return new FakeTokenVerifier({
        [HEADER_CAP]: capabilityData(3600),
        [QUERY_CAP_60]: capabilityData(60),
        [QUERY_CAP_61]: capabilityData(61),
        [MALFORMED_CAP]: capabilityData(3600, { cap: ['bucket'] }),
        [CAP_NO_SUB_KIND]: capabilityData(3600, { sub_kind: undefined }),
        // A verified payload is not type-checked at runtime; Object.assign plants the foreign value.
        [CAP_SERVICE_SUB_KIND]: Object.assign(capabilityData(3600), { sub_kind: 'service' }),
        [CAP_NO_CAP]: capabilityData(3600, { cap: undefined }),
    });
}

function createTokenVerifier() {
    return new FakeTokenVerifier({
        [ACCESS]: accessData(),
        [ACCESS_NO_KIND]: accessData({ kind: undefined }),
        // A verifier that let a capability token through must not make it an identity.
        [CAP_AS_ACCESS]: accessData({ kind: 'capability_token' }),
    });
}

type Setup = {
    capability?: boolean,
    tokenVerifier?: FakeTokenVerifier,
    capabilityVerifier?: FakeTokenVerifier,
    guard?: { run(event: IAppEvent): unknown },
};

function createApp(setup: Setup = {}) {
    const app = new App();

    const options: AuthorizationMiddlewareRegistrationOptions = {
        authupClient: new Client({
            baseURL: 'http://authup.test',
            transport: new MemoryTransport({ fetch: () => ({ status: 200, body: catalog }) }),
        }),
        tokenVerifier: setup.tokenVerifier ?? createTokenVerifier(),
    };

    // The cookie parser, as every service mounts it before authorization.
    mountBasicMiddleware(app);

    if (setup.capability ?? true) {
        options.capability = { verifier: setup.capabilityVerifier ?? createCapabilityVerifier() };
    }

    mountAuthorizationMiddleware(app, options);

    if (setup.guard) {
        const { guard } = setup;

        app.use(defineCoreHandler((event) => guard.run(event)));
    }

    app.get('/', defineCoreHandler((event) => {
        const capability = useRequestCapability(event);
        const identity = useRequestIdentity(event);

        return {
            capability: capability ?? null,
            identity: identity ? { id: identity.id, type: identity.type } : null,
            token: useRequestToken(event) ?? null,
        };
    }));

    mountErrorMiddleware(app);

    return app;
}

type Echo = {
    capability: {
        source: string,
        subject: {
            id: string, 
            type: string, 
            realmId: string, 
            realmName?: string 
        },
        actor?: { id: string, type?: string },
        entries: {
            type: string, 
            id: string, 
            actions: string[] 
        }[],
        issuedAt: number,
        expiresAt: number,
    } | null,
    identity: { id: string, type: string } | null,
    token: string | null,
};

async function request(
    app: App,
    input: {
        path?: string, 
        bearer?: string, 
        cookie?: string 
    } = {},
): Promise<{ status: number, body?: Echo }> {
    const headers: Record<string, string> = {};

    if (input.bearer) {
        headers.authorization = `Bearer ${input.bearer}`;
    }

    if (input.cookie) {
        headers.cookie = `access_token=${input.cookie}`;
    }

    const response = await app.fetch(new Request(`http://hub.test${input.path ?? '/'}`, { headers }));

    if (response.status !== 200) {
        return { status: response.status };
    }

    return { status: response.status, body: await response.json() };
}

describe('authorization middleware: capability tokens', () => {
    it('sets a header capability and no identity', async () => {
        const res = await request(createApp(), { bearer: HEADER_CAP });

        expect(res.status).toBe(200);
        expect(res.body?.identity).toBeNull();
        expect(res.body?.token).toBeNull();
        expect(res.body?.capability).toEqual({
            source: 'header',
            subject: {
                id: SUBJECT_ID,
                type: 'user',
                realmId: REALM_ID,
                realmName: 'master',
            },
            actor: { id: 'analysis-client', type: 'client' },
            entries: [{
                type: 'bucket', 
                id: BUCKET_ID, 
                actions: ['read'], 
            }],
            issuedAt: now,
            expiresAt: now + 3600,
        });
    });

    it('stores the raw bearer of an access token next to the identity', async () => {
        const res = await request(createApp(), { bearer: ACCESS });

        expect(res.status).toBe(200);
        expect(res.body?.identity).toEqual({ id: SUBJECT_ID, type: 'user' });
        expect(res.body?.token).toBe(ACCESS);
        expect(res.body?.capability).toBeNull();
    });

    it('treats a token without a kind claim as an access token', async () => {
        const res = await request(createApp(), { bearer: ACCESS_NO_KIND });

        expect(res.status).toBe(200);
        expect(res.body?.identity).toEqual({ id: SUBJECT_ID, type: 'user' });
        expect(res.body?.token).toBe(ACCESS_NO_KIND);
    });

    it('stores the raw cookie token of an identity request', async () => {
        const res = await request(createApp(), { cookie: ACCESS });

        expect(res.status).toBe(200);
        expect(res.body?.identity).toEqual({ id: SUBJECT_ID, type: 'user' });
        expect(res.body?.token).toBe(ACCESS);
    });

    it('accepts a query capability living 60 seconds', async () => {
        const res = await request(createApp(), { path: `/?dt=${QUERY_CAP_60}` });

        expect(res.status).toBe(200);
        expect(res.body?.capability?.source).toBe('query');
        expect(res.body?.identity).toBeNull();
    });

    it('refuses a query capability living 61 seconds', async () => {
        const res = await request(createApp(), { path: `/?dt=${QUERY_CAP_61}` });

        expect(res.status).toBe(401);
    });

    it('ignores the query token when no capability verifier is configured', async () => {
        const tokenVerifier = createTokenVerifier();
        const res = await request(createApp({ capability: false, tokenVerifier }), { path: `/?dt=${QUERY_CAP_60}` });

        expect(res.status).toBe(200);
        expect(res.body?.capability).toBeNull();
        expect(res.body?.identity).toBeNull();
        expect(tokenVerifier.calls).toEqual([]);
    });

    it('refuses an access token in the query', async () => {
        const tokenVerifier = createTokenVerifier();
        const capabilityVerifier = createCapabilityVerifier();
        const res = await request(createApp({ tokenVerifier, capabilityVerifier }), { path: `/?dt=${ACCESS}` });

        expect(res.status).toBe(401);
        expect(tokenVerifier.calls).toEqual([]);
    });

    it('refuses more than one query token', async () => {
        const res = await request(createApp(), { path: `/?dt=${QUERY_CAP_60}&dt=${QUERY_CAP_60}` });

        expect(res.status).toBe(401);
    });

    it('lets the header win over the query token', async () => {
        const res = await request(createApp(), { path: `/?dt=${QUERY_CAP_60}`, bearer: ACCESS });

        expect(res.status).toBe(200);
        expect(res.body?.identity).toEqual({ id: SUBJECT_ID, type: 'user' });
        expect(res.body?.capability).toBeNull();
    });

    it('lets the query token win over the cookie, and skips the cookie', async () => {
        const tokenVerifier = createTokenVerifier();
        const res = await request(createApp({ tokenVerifier }), { path: `/?dt=${QUERY_CAP_60}`, cookie: ACCESS });

        expect(res.status).toBe(200);
        expect(res.body?.capability?.source).toBe('query');
        expect(res.body?.identity).toBeNull();
        expect(tokenVerifier.calls).toEqual([]);
    });

    it('verifies a capability token with the identity verifier when no capability verifier is configured', async () => {
        const tokenVerifier = createTokenVerifier();
        const res = await request(createApp({ capability: false, tokenVerifier }), { bearer: HEADER_CAP });

        expect(res.status).toBe(401);
        expect(tokenVerifier.calls).toEqual([HEADER_CAP]);
    });

    it('refuses an identity verification result of kind capability_token', async () => {
        const res = await request(createApp(), { bearer: CAP_AS_ACCESS });

        expect(res.status).toBe(401);
    });

    it.each([
        ['a malformed cap entry', MALFORMED_CAP],
        ['a missing sub_kind', CAP_NO_SUB_KIND],
        ['a sub_kind outside user and client', CAP_SERVICE_SUB_KIND],
        ['a missing cap claim', CAP_NO_CAP],
    ])('refuses a verified capability token with %s', async (_label, token) => {
        const res = await request(createApp(), { bearer: token });

        expect(res.status).toBe(401);
    });

    it('refuses a capability token the capability verifier does not accept', async () => {
        const forged = buildToken({ kind: 'capability_token', n: 99 });
        const res = await request(createApp(), { bearer: forged });

        expect(res.status).toBe(401);
    });
});

describe('capability guards', () => {
    it('ForceLoggedInMiddleware refuses a header capability', async () => {
        const app = createApp({ guard: new ForceLoggedInMiddleware() });

        expect((await request(app, { bearer: HEADER_CAP })).status).toBe(401);
        expect((await request(app, { bearer: ACCESS })).status).toBe(200);
    });

    it('ForceIdentityOrCapabilityMiddleware accepts an identity or a header capability, refuses a query capability', async () => {
        const app = createApp({ guard: new ForceIdentityOrCapabilityMiddleware() });

        expect((await request(app, { bearer: ACCESS })).status).toBe(200);
        expect((await request(app, { bearer: HEADER_CAP })).status).toBe(200);
        expect((await request(app, { path: `/?dt=${QUERY_CAP_60}` })).status).toBe(401);
        expect((await request(app)).status).toBe(401);
    });

    it('ForceIdentityOrStreamCapabilityMiddleware accepts an identity or any capability', async () => {
        const app = createApp({ guard: new ForceIdentityOrStreamCapabilityMiddleware() });

        expect((await request(app, { bearer: ACCESS })).status).toBe(200);
        expect((await request(app, { bearer: HEADER_CAP })).status).toBe(200);
        expect((await request(app, { path: `/?dt=${QUERY_CAP_60}` })).status).toBe(200);
        expect((await request(app)).status).toBe(401);
    });
});

describe('createAuthupCapabilityTokenVerifier', () => {
    it('refuses every token without an Authup URL', () => {
        const verifier = createAuthupCapabilityTokenVerifier({ audience: 'storage' });

        expect(verifier).toBeInstanceOf(UnconfiguredTokenVerifier);
    });

    it('refuses a credential that is not a compact JWS before verifying it', async () => {
        const verifier = createAuthupCapabilityTokenVerifier({ baseURL: 'http://authup.test', audience: 'storage' });

        await expect(verifier.verify('not-a-token')).rejects.toThrow(UnauthorizedError);
    });
});
