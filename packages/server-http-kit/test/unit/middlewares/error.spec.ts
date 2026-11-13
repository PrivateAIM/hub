/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from '@authup/core-http-kit';
import { UpstreamTimeoutError } from '@authup/errors';
import type { ITokenVerifier, TokenVerificationData } from '@authup/server-adapter-kit';
import { MemoryTransport } from 'hapic';
import { App, defineCoreHandler } from 'routup';
import { describe, expect, it } from 'vitest';
import { mountAuthorizationMiddleware, mountErrorMiddleware } from '../../../src/middlewares/index.ts';

/**
 * A verifier whose introspection did not answer within its bound, as
 * authup's verifier reports it.
 */
class TimingOutTokenVerifier implements ITokenVerifier {
    async verify(): Promise<TokenVerificationData> {
        throw new UpstreamTimeoutError();
    }
}

function createApp() {
    const app = new App();

    mountAuthorizationMiddleware(app, {
        authupClient: new Client({
            baseURL: 'http://authup.test',
            transport: new MemoryTransport({ fetch: () => ({ status: 200, body: { permissions: [], policies: {} } }) }),
        }),
        tokenVerifier: new TimingOutTokenVerifier(),
    });

    app.get('/', defineCoreHandler(() => ({ ok: true })));

    mountErrorMiddleware(app);

    return app;
}

describe('mountErrorMiddleware', () => {
    it('answers a token verification timeout 504, neither 401 nor 502', async () => {
        const response = await createApp().fetch(new Request('http://hub.test/', { headers: { authorization: 'Bearer token' } }));

        expect(response.status).toEqual(504);
        await expect(response.json()).resolves.toMatchObject({ statusCode: 504, code: 'upstream_timeout' });
    });
});
