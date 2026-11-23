/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from '@authup/core-http-kit';
import { UpstreamTimeoutError } from '@authup/errors';
import type { ITokenVerifier, TokenVerificationData } from '@authup/server-adapter-kit';
import { LoggerMemoryTransport, createLogger } from '@privateaim/server-kit';
import { basic } from '@routup/basic';
import { readRequestBody } from '@routup/basic/body';
import { MemoryTransport } from 'hapic';
import { App, createError, defineCoreHandler } from 'routup';
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

    describe('errors routup or a plugin raised itself', () => {
        function createBodyApp(transport: LoggerMemoryTransport) {
            const app = new App();

            app.use(basic({ body: { json: { limit: 16 } } }));
            app.post('/', defineCoreHandler(async (event) => ({ body: await readRequestBody(event) })));
            app.get('/gone', defineCoreHandler(() => {
                throw createError({ status: 410, message: 'gone' });
            }));
            app.get('/crash/:id', defineCoreHandler(() => {
                throw new Error('boom');
            }));

            mountErrorMiddleware(app, { logger: createLogger({ transports: [transport] }) });

            return app;
        }

        function post(app: App, body: string, headers: Record<string, string> = {}) {
            return app.fetch(new Request('http://hub.test/', {
                method: 'POST',
                headers: { 'content-type': 'application/json', ...headers },
                body,
            }));
        }

        it('answers an invalid JSON body 400 and logs nothing', async () => {
            const transport = new LoggerMemoryTransport();
            const response = await post(createBodyApp(transport), '{bad');

            expect(response.status).toEqual(400);
            await expect(response.json()).resolves.toMatchObject({ statusCode: 400, code: 'bad_request' });
            expect(transport.items).toHaveLength(0);
        });

        it('answers a body over the limit 413', async () => {
            const transport = new LoggerMemoryTransport();
            const response = await post(createBodyApp(transport), JSON.stringify({ value: 'x'.repeat(64) }));

            expect(response.status).toEqual(413);
            expect(transport.items).toHaveLength(0);
        });

        it('answers an unsupported content encoding 415', async () => {
            const transport = new LoggerMemoryTransport();
            const response = await post(createBodyApp(transport), '{}', { 'content-encoding': 'unknown' });

            expect(response.status).toEqual(415);
            expect(transport.items).toHaveLength(0);
        });

        it('keeps the status of an error created without a cause', async () => {
            const transport = new LoggerMemoryTransport();
            const response = await createBodyApp(transport).fetch(new Request('http://hub.test/gone'));

            expect(response.status).toEqual(410);
            expect(transport.items).toHaveLength(0);
        });

        it('answers a thrown error 500 and logs the thrown error', async () => {
            const transport = new LoggerMemoryTransport();
            const response = await createBodyApp(transport).fetch(new Request('http://hub.test/crash/42'));

            expect(response.status).toEqual(500);
            expect(transport.items).toHaveLength(1);
            expect(transport.items[0].message).toContain('boom');
            expect(transport.items[0]).toMatchObject({ method: 'GET', route: '/crash/:id' });
        });
    });
});
