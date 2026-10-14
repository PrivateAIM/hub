/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthorizationCatalog } from '@authup/access';
import { Client } from '@authup/core-http-kit';
import type { ITokenVerifier, TokenVerificationData } from '@authup/server-adapter-kit';
import { MemoryTransport } from 'hapic';
import { App, defineCoreHandler } from 'routup';
import { describe, expect, it } from 'vitest';
import { mountAuthorizationMiddleware } from '../../../../src/middlewares/authup/middleware.ts';
import { useRequestPermissionEvaluator } from '../../../../src/request/index.ts';

const catalog: AuthorizationCatalog = {
    permissions: [{
        name: 'node_update',
        realm_id: null,
        client_id: null,
        decision_strategy: null,
        policies: ['binding'],
    }],
    policies: { binding: { type: 'permissionBinding' } },
};

class FakeTokenVerifier implements ITokenVerifier {
    protected scope: string;

    constructor(scope: string) {
        this.scope = scope;
    }

    async verify(): Promise<TokenVerificationData> {
        return {
            sub: '00000000-0000-4000-8000-000000000001',
            sub_kind: 'user',
            realm_id: '00000000-0000-4000-8000-000000000002',
            realm_name: 'master',
            scope: this.scope,
            permissions: [{ name: 'node_update', realm_scope: 'any' }],
        };
    }
}

async function requestWithScope(scope: string): Promise<number> {
    const app = new App();
    mountAuthorizationMiddleware(app, {
        authupClient: new Client({
            baseURL: 'http://authup.test',
            transport: new MemoryTransport({ fetch: () => ({ status: 200, body: catalog }) }),
        }),
        tokenVerifier: new FakeTokenVerifier(scope),
    });
    app.get('/', defineCoreHandler(async (event) => {
        try {
            await useRequestPermissionEvaluator(event).preEvaluate({ name: 'node_update' });
            return { granted: true };
        } catch {
            event.response.status = 403;
            return { granted: false };
        }
    }));

    const response = await app.fetch(new Request('http://hub.test/', { headers: { authorization: 'Bearer token' } }));
    return response.status;
}

/**
 * authup places the identity — and with it the grants — only for a token
 * scoped `global`. Hub used to place it unconditionally, so a narrowly-scoped
 * token was evaluated with its full grants.
 */
describe('authorization middleware scope gate', () => {
    it('evaluates the grants of a global-scoped token', async () => {
        expect(await requestWithScope('global openid')).toBe(200);
    });

    it('withholds the grants of a token without global scope', async () => {
        expect(await requestWithScope('openid')).toBe(403);
    });
});
