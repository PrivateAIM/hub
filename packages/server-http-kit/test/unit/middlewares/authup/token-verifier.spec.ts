/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createHash } from 'node:crypto';
import { once } from 'node:events';
import type { Server } from 'node:http';
import { createServer } from 'node:http';
import type { ITokenCache } from '@authup/server-adapter-kit';
import { isHubError, isUnauthorizedError } from '@privateaim/errors';
import {
    afterEach,
    describe,
    expect,
    it,
} from 'vitest';
import { createAuthupTokenVerifier } from '../../../../src/middlewares/authup/token-verifier.ts';

// A structurally valid compact JWS (header.payload.signature); never verified.
const jws = [
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9',
    'eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ',
    'c2lnbmF0dXJlLXZhbHVlLXdpdGgtdXJsLXNhZmUtY2hhcnNfLQ',
].join('.');

const client = {
    id: 'core',
    secret: 'start123',
    realm: 'master',
};

type FakeAuthup = {
    server: Server,
    url: string,
    /**
     * The `client_id` of every token request, in order.
     */
    mints: string[],
    /**
     * Every request path, in order.
     */
    requests: string[],
};

const servers: Server[] = [];

afterEach(async () => {
    await Promise.all(servers.map((server) => new Promise((resolve) => {
        server.close(resolve);
    })));
    servers.length = 0;
});

function readClientId(body: string, contentType: string | undefined): string {
    if (contentType?.includes('application/json')) {
        const parsed: unknown = JSON.parse(body);

        if (typeof parsed === 'object' && parsed !== null && 'client_id' in parsed && typeof parsed.client_id === 'string') {
            return parsed.client_id;
        }

        return '';
    }

    return new URLSearchParams(body).get('client_id') ?? '';
}

/**
 * An Authup that answers the introspection with a fixed status and body, and
 * hands out a service token on any other path, recording who asked for it.
 */
async function serveAuthup(status: number, body: Record<string, any>): Promise<FakeAuthup> {
    const mints: string[] = [];
    const requests: string[] = [];

    const server = createServer(async (req, res) => {
        const isIntrospection = !!req.url?.startsWith('/token/introspect');

        requests.push(req.url ?? '');

        const chunks: Buffer[] = await Array.fromAsync(req);

        if (!isIntrospection) {
            mints.push(readClientId(Buffer.concat(chunks).toString(), req.headers['content-type']));
        }

        res.writeHead(isIntrospection ? status : 200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(isIntrospection ?
            body :
            {
                access_token: 'service-token',
                expires_in: 3600,
                token_type: 'Bearer',
            }));
    });

    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    servers.push(server);

    const address = server.address();

    if (!address || typeof address === 'string') {
        throw new Error('The fake Authup has no TCP address.');
    }

    return {
        server,
        url: `http://127.0.0.1:${address.port}/`,
        mints,
        requests,
    };
}

/**
 * A cache that records every key it is asked for and never hits.
 */
function createRecordingCache(keys: string[]): ITokenCache {
    return {
        get: async (key) => {
            keys.push(key);

            return undefined;
        },
        set: async () => undefined,
    };
}

/**
 * The cache key vouchly derives: SHA-256 (hex) of `<namespace>\0<token>`.
 */
function cacheKeyOf(namespace: string, token: string): string {
    return createHash('sha256').update(`${namespace}\0${token}`).digest('hex');
}

/**
 * An Authup server <= 1.0.0-beta.69 reports a malformed introspected token as
 * the CALLING service's own client (authup#3724), and the beta.70 verifier
 * still forwards such a token to introspection, so the verifier every service
 * builds must refuse it first — no token is ever minted for the call. This is
 * the guard's only pin in CI: the suites run against the installed (>= beta.70)
 * Authup image, which answers the same tokens `active: false` by itself.
 */
describe('createAuthupTokenVerifier', () => {
    it('refuses a malformed token before introspecting it', async () => {
        const authup = await serveAuthup(200, { active: false });
        const verifier = createAuthupTokenVerifier({
            baseURL: authup.url,
            client,
        });

        const error = await verifier.verify('not-a-token').then(() => undefined, (e: unknown) => e);

        expect(isUnauthorizedError(error)).toBe(true);
        expect(authup.requests).toEqual([]);
    });

    /**
     * authup 1.0.0-beta.70's `TokenVerifier` throws a TypeError in its
     * constructor without a base URL, so a service booted without
     * `AUTHUP_URL` (a supported mode: every protected route answers 401)
     * must not construct one.
     */
    it('builds a verifier without an Authup URL that refuses every token', async () => {
        const verifier = createAuthupTokenVerifier({ client });

        const error = await verifier.verify(jws).then(() => undefined, (e: unknown) => e);

        expect(isUnauthorizedError(error)).toBe(true);
    });
});

/**
 * authup answers `active: false` to a client not allowed to introspect a
 * token, so a cached result is only valid for the client that asked: services
 * sharing one Redis must not share entries across introspecting clients.
 */
describe('createAuthupTokenVerifier cache namespace', () => {
    async function keyOf(baseURL: string, input: typeof client): Promise<string> {
        const keys: string[] = [];
        const verifier = createAuthupTokenVerifier({
            baseURL,
            client: input,
            cache: createRecordingCache(keys),
        });

        await verifier.verify(jws).catch(() => undefined);

        expect(keys).toHaveLength(1);

        return keys[0];
    }

    /**
     * The namespace is part of every Redis key: changing it for an unchanged
     * configuration invalidates every cached entry on rollout, and services
     * sharing a Redis stop sharing entries.
     */
    it('keeps the namespace byte-stable', async () => {
        const baseURL = 'http://authup:3000/';

        await expect(keyOf(baseURL, client)).resolves
            .toEqual(cacheKeyOf('authup:remote:http://authup:3000/:client:master:core', jws));
    });

    it('names the client that mints the introspection token', async () => {
        const authup = await serveAuthup(200, { active: false });
        const keys: string[] = [];

        for (const id of ['core', 'storage']) {
            const verifier = createAuthupTokenVerifier({
                baseURL: authup.url,
                client: { ...client, id },
                cache: createRecordingCache(keys),
            });

            await verifier.verify(jws).catch(() => undefined);
        }

        expect(authup.mints).toEqual(['core', 'storage']);
        expect(keys).toEqual([
            cacheKeyOf(`authup:remote:${authup.url}:client:master:${authup.mints[0]}`, jws),
            cacheKeyOf(`authup:remote:${authup.url}:client:master:${authup.mints[1]}`, jws),
        ]);
    });

    it('separates verifiers introspecting as different clients or realms', async () => {
        const baseURL = 'http://127.0.0.1:1/';
        const core = await keyOf(baseURL, client);

        await expect(keyOf(baseURL, { ...client, id: 'storage' })).resolves.not.toEqual(core);
        await expect(keyOf(baseURL, { ...client, realm: 'other' })).resolves.not.toEqual(core);
        await expect(keyOf('http://127.0.0.1:2/', client)).resolves.not.toEqual(core);
    });

    it('lets verifiers of one client share entries', async () => {
        const baseURL = 'http://127.0.0.1:1/';

        await expect(keyOf(baseURL, client)).resolves.toEqual(await keyOf(baseURL, { ...client }));
    });
});

/**
 * vouchly reports a failed introspection request as `introspection_failed`,
 * which authup's adapter turns into `invalid_token` (401) — a status every
 * authup client hook answers by dropping its session, although the caller's
 * token was never judged. Hub answers such a failure 502.
 */
describe('createAuthupTokenVerifier upstream failures', () => {
    async function verifyAgainst(status: number, body: Record<string, any>): Promise<unknown> {
        const authup = await serveAuthup(status, body);

        const verifier = createAuthupTokenVerifier({
            baseURL: authup.url,
            client,
        });

        return verifier.verify(jws).then(() => undefined, (e: unknown) => e);
    }

    it.each([503, 500, 429])('answers 502 when the introspection endpoint answers %s', async (status) => {
        const error = await verifyAgainst(status, { code: 'internal_error', message: 'down' });

        expect(isHubError(error)).toBe(true);
        expect(error).toMatchObject({ code: 'upstream_error', status: 502 });
    });

    it('answers 502 when Authup is unreachable', async () => {
        const verifier = createAuthupTokenVerifier({
            baseURL: 'http://127.0.0.1:1/',
            client,
        });

        const error = await verifier.verify(jws).then(() => undefined, (e: unknown) => e);

        expect(error).toMatchObject({ code: 'upstream_error', status: 502 });
    });

    it('keeps the 401 of a token Authup judged inactive', async () => {
        const error = await verifyAgainst(200, { active: false });

        expect(isHubError(error)).toBe(false);
        expect(error).toMatchObject({ code: 'inactive_token' });
    });
});
