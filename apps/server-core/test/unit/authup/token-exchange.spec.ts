/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { UnauthorizedError } from '@privateaim/errors';
import { exchangeAuthupToken } from '@privateaim/server-kit';
import { createAdminAccessToken } from '@privateaim/server-test-kit';
import { describe, expect, it } from 'vitest';

function decodePayload(token: string): Record<string, any> {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
}

function context() {
    return {
        baseURL: process.env.AUTHUP_URL as string,
        clientId: 'system',
        clientSecret: 'start123',
        realm: 'master',
    };
}

describe('exchangeAuthupToken', () => {
    it('exchanges an access token for a capability token', async () => {
        const subjectToken = await createAdminAccessToken();

        const result = await exchangeAuthupToken(context(), {
            subjectToken,
            audience: 'storage',
            cap: ['bucket:b1:read,write'],
            expiresIn: 60,
        });

        const payload = decodePayload(result.token);

        expect(payload.kind).toEqual('capability_token');
        expect([payload.aud].flat()).toContain('storage');
        expect(payload.cap).toEqual(['bucket:b1:read,write']);
        expect(payload.act.sub).toBeDefined();
        expect(payload.exp - payload.iat).toBeLessThanOrEqual(60);
        expect(result.expiresIn).toBeGreaterThan(0);
        expect(result.expiresIn).toBeLessThanOrEqual(60);
    });

    it('answers 401 for a refused subject token', async () => {
        await expect(exchangeAuthupToken(context(), {
            subjectToken: 'x'.repeat(40),
            audience: 'storage',
            cap: ['bucket:b1:read'],
        })).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it('answers 502 for an audience the client may not delegate', async () => {
        const subjectToken = await createAdminAccessToken();

        await expect(exchangeAuthupToken(context(), {
            subjectToken,
            audience: 'telemetry',
            cap: ['bucket:b1:read'],
        })).rejects.toMatchObject({ status: 502 });
    });
});
