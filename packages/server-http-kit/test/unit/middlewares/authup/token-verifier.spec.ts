/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { once } from 'node:events';
import type { Server } from 'node:http';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { ITokenCache } from '@authup/server-adapter-kit';
import { isHubError, isUnauthorizedError } from '@privateaim/errors';
import {
    afterEach, 
    describe, 
    expect, 
    it,
} from 'vitest';
import {
    buildAuthupTokenCacheNamespace,
    createAuthupTokenVerifier,
} from '../../../../src/middlewares/authup/token-verifier.ts';

// A structurally valid compact JWS (header.payload.signature); never verified.
const jws = [
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9',
    'eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ',
    'c2lnbmF0dXJlLXZhbHVlLXdpdGgtdXJsLXNhZmUtY2hhcnNfLQ',
].join('.');

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
        let minted = 0;
        const verifier = createAuthupTokenVerifier({
            baseURL: 'http://authup.invalid',
            creator: async () => {
                minted += 1;
                throw new Error('introspection must not be reached');
            },
        });

        const error = await verifier.verify('not-a-token').then(() => undefined, (e: unknown) => e);

        expect(isUnauthorizedError(error)).toBe(true);
        expect(minted).toBe(0);
    });

    /**
     * authup 1.0.0-beta.70's `TokenVerifier` throws a TypeError in its
     * constructor without a base URL, so a service booted without
     * `AUTHUP_URL` (a supported mode: every protected route answers 401)
     * must not construct one.
     */
    it('builds a verifier without an Authup URL that refuses every token', async () => {
        let minted = 0;
        const verifier = createAuthupTokenVerifier({
            creator: async () => {
                minted += 1;
                throw new Error('introspection must not be reached');
            },
        });

        const error = await verifier.verify(jws).then(() => undefined, (e: unknown) => e);

        expect(isUnauthorizedError(error)).toBe(true);
        expect(minted).toBe(0);
    });
});

/**
 * authup answers `active: false` to a client not allowed to introspect a
 * token, so a cached result is only valid for the client that asked: services
 * sharing one Redis must not share entries across introspecting clients.
 */
describe('buildAuthupTokenCacheNamespace', () => {
    const baseURL = 'http://authup:3000/';

    it('separates verifiers introspecting as different clients', () => {
        const core = buildAuthupTokenCacheNamespace({
            baseURL,
            clientId: 'core',
            realm: 'master',
        });
        const storage = buildAuthupTokenCacheNamespace({
            baseURL,
            clientId: 'storage',
            realm: 'master',
        });
        const otherRealm = buildAuthupTokenCacheNamespace({
            baseURL,
            clientId: 'core',
            realm: 'other',
        });

        expect(core).not.toEqual(storage);
        expect(core).not.toEqual(otherRealm);
        expect(core).not.toEqual('authup:remote:http://authup:3000/');
    });

    it('lets verifiers of one client share entries', () => {
        expect(buildAuthupTokenCacheNamespace({
            baseURL,
            clientId: 'system',
            realm: 'master',
        }))
            .toEqual(buildAuthupTokenCacheNamespace({
                baseURL,
                clientId: 'system',
                realm: 'master',
            }));
    });

    it('keeps authup\'s default without a client id', () => {
        expect(buildAuthupTokenCacheNamespace({ baseURL })).toBeUndefined();
    });
});

/**
 * An Authup that answers the introspection with a fixed status and body, and
 * hands out a service token on any other path.
 */
async function serveAuthup(status: number, body: Record<string, any>): Promise<Server> {
    const server = createServer((req, res) => {
        res.writeHead(req.url?.startsWith('/token/introspect') ? status : 200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(req.url?.startsWith('/token/introspect') ?
            body :
            {
                access_token: 'service-token', 
                expires_in: 3600, 
                token_type: 'Bearer', 
            }));
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    return server;
}

function urlOf(server: Server): string {
    return `http://127.0.0.1:${(server.address() as AddressInfo).port}/`;
}

/**
 * vouchly reports a failed introspection request as `introspection_failed`,
 * which authup's adapter turns into `invalid_token` (401) — a status every
 * authup client hook answers by dropping its session, although the caller's
 * token was never judged. Hub answers such a failure 502.
 */
describe('createAuthupTokenVerifier upstream failures', () => {
    const servers: Server[] = [];

    afterEach(async () => {
        await Promise.all(servers.map((server) => new Promise((resolve) => {
            server.close(resolve);
        })));
        servers.length = 0;
    });

    async function verifyAgainst(status: number, body: Record<string, any>): Promise<unknown> {
        const server = await serveAuthup(status, body);
        servers.push(server);

        const verifier = createAuthupTokenVerifier({
            baseURL: urlOf(server),
            creator: async () => ({
                access_token: 'service-token', 
                expires_in: 3600, 
                token_type: 'Bearer', 
            }),
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
            creator: async () => ({
                access_token: 'service-token', 
                expires_in: 3600, 
                token_type: 'Bearer', 
            }),
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

/**
 * The namespace must actually reach the cache: two verifiers introspecting as
 * different clients write different keys for the same token.
 */
describe('createAuthupTokenVerifier cache namespace wiring', () => {
    it('keys cached results by the introspecting client', async () => {
        const keys: string[] = [];
        const cache: ITokenCache = {
            get: async (key) => {
                keys.push(key);
                return undefined;
            },
            set: async () => undefined,
        };

        for (const clientId of ['core', 'storage']) {
            const verifier = createAuthupTokenVerifier({
                baseURL: 'http://127.0.0.1:1/',
                creator: async () => ({
                    access_token: 'service-token', 
                    expires_in: 3600, 
                    token_type: 'Bearer', 
                }),
                clientId,
                realm: 'master',
                cache,
            });
            await verifier.verify(jws).catch(() => undefined);
        }

        expect(keys).toHaveLength(2);
        expect(keys[0]).not.toEqual(keys[1]);
    });
});
