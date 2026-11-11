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
import { isJWTError } from '@authup/specs';
import { isHubError } from '@privateaim/errors';
import {
    afterEach,
    describe,
    expect,
    it,
} from 'vitest';
import { createAuthupCapabilityTokenVerifier } from '../../../../src/middlewares/authup/capability-token-verifier.ts';

function base64url(input: string): string {
    return Buffer.from(input, 'utf8').toString('base64url');
}

function buildToken(baseURL: string): string {
    return [
        base64url(JSON.stringify({
            alg: 'RS256', 
            typ: 'JWT', 
            kid: '00000000-0000-4000-8000-000000000004', 
        })),
        base64url(JSON.stringify({
            iss: baseURL,
            realm_id: '00000000-0000-4000-8000-000000000002',
            kind: 'capability_token',
            aud: 'storage',
            exp: Math.floor(Date.now() / 1000) + 60,
        })),
        base64url('signature'),
    ].join('.');
}

describe('createAuthupCapabilityTokenVerifier', () => {
    let server: Server | undefined;

    afterEach(async () => {
        if (!server) {
            return;
        }

        server.close();
        await once(server, 'close');
        server = undefined;
    });

    /**
     * An Authup whose key endpoint is down says nothing about the token, so it
     * must not read as a refused credential (a 401 drops the client session).
     */
    it('answers 502 when the signing keys cannot be fetched', async () => {
        server = createServer((_req, res) => {
            res.statusCode = 500;
            res.end();
        });
        server.listen(0, '127.0.0.1');
        await once(server, 'listening');

        const baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
        const verifier = createAuthupCapabilityTokenVerifier({ baseURL, audience: 'storage' });

        const error = await verifier.verify(buildToken(baseURL)).then(() => undefined, (e: unknown) => e);

        expect(isHubError(error)).toBe(true);
        expect(error).toMatchObject({ status: 502, code: 'upstream_error' });
    });

    it('keeps answering 401 for a key the issuer does not know', async () => {
        server = createServer((_req, res) => {
            res.statusCode = 404;
            res.end();
        });
        server.listen(0, '127.0.0.1');
        await once(server, 'listening');

        const baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
        const verifier = createAuthupCapabilityTokenVerifier({ baseURL, audience: 'storage' });

        const error = await verifier.verify(buildToken(baseURL)).then(() => undefined, (e: unknown) => e);

        // authup's JWTError is what the middleware answers as 401
        expect(isJWTError(error)).toBe(true);
        expect(isHubError(error)).toBe(false);
    });
});
