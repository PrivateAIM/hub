/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isUnauthorizedError } from '@privateaim/errors';
import { describe, expect, it } from 'vitest';
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
