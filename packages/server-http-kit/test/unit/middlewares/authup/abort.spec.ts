/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client } from '@authup/core-http-kit';
import type { ITokenVerifier, TokenVerificationData, TokenVerifyOptions } from '@authup/server-adapter-kit';
import { LoggerMemoryTransport, createLogger } from '@privateaim/server-kit';
import { MemoryTransport } from 'hapic';
import { App, defineCoreHandler } from 'routup';
import { describe, expect, it } from 'vitest';
import { mountAuthorizationMiddleware, mountErrorMiddleware } from '../../../../src/middlewares/index.ts';

/**
 * A verifier that answers only when the request is abandoned, as authup's
 * verifier does with the signal it is handed.
 */
class PendingTokenVerifier implements ITokenVerifier {
    public signals: AbortSignal[] = [];

    async verify(_token: string, options: TokenVerifyOptions = {}): Promise<TokenVerificationData> {
        const { signal } = options;

        if (signal) {
            this.signals.push(signal);
        }

        return new Promise((_resolve, reject) => {
            signal?.addEventListener('abort', () => reject(signal.reason), { once: true });
        });
    }
}

describe('mountAuthorizationMiddleware: abandoned request', () => {
    it('aborts token verification with the request and logs nothing', async () => {
        const verifier = new PendingTokenVerifier();
        const transport = new LoggerMemoryTransport();
        const app = new App();

        mountAuthorizationMiddleware(app, {
            authupClient: new Client({
                baseURL: 'http://authup.test',
                transport: new MemoryTransport({ fetch: () => ({ status: 200, body: { permissions: [], policies: {} } }) }),
            }),
            tokenVerifier: verifier,
        });
        app.get('/', defineCoreHandler(() => ({ ok: true })));
        mountErrorMiddleware(app, { logger: createLogger({ transports: [transport] }) });

        const controller = new AbortController();
        const pending = app.fetch(new Request('http://hub.test/', {
            headers: { authorization: 'Bearer token' },
            signal: controller.signal,
        }));

        await expect.poll(() => verifier.signals.length).toEqual(1);
        controller.abort();
        await pending.catch(() => undefined);

        expect(verifier.signals[0].aborted).toBe(true);
        expect(transport.items).toHaveLength(0);
    });
});
