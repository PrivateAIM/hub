/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthorizationCatalog } from '@authup/access';
import { BuiltInPolicyType, definePolicyData } from '@authup/access';
import { Client } from '@authup/core-http-kit';
import { MemoryTransport } from 'hapic';
import { describe, expect, it } from 'vitest';
import { createAuthupPermissionEvaluator } from '../../src/authup/authorization.ts';

const catalog: AuthorizationCatalog = {
    permissions: [{
        name: 'node_update',
        realm_id: null,
        client_id: null,
        decision_strategy: null,
        policies: ['binding'],
    }],
    policies: { binding: { type: 'permissionBinding' }, restricted: { type: 'attributes', query: { name: 'allowed' } } },
};
const identity = {
    id: '00000000-0000-4000-8000-000000000001',
    type: 'user' as const,
    realmId: '00000000-0000-4000-8000-000000000002',
    realmName: 'tenant',
};

describe('Authup authorization catalog', () => {
    it('loads once for repeated checks and enforces grant realm and policy restrictions', async () => {
        let requests = 0;
        const client = new Client({
            baseURL: 'http://authup.test',
            transport: new MemoryTransport({
                fetch: (request) => {
                    expect(new URL(request.url).pathname).toBe('/authorization');
                    requests += 1;
                    return { status: 200, body: catalog };
                },
            }),
        });
        const evaluator = await createAuthupPermissionEvaluator(client, {
            identity,
            grants: [{
                name: 'node_update',
                realm_scope: 'own',
                policies: ['restricted'],
            }],
        });
        const data = (realm: string, name: string) => definePolicyData({
            [BuiltInPolicyType.REALM_MATCH]: realm,
            [BuiltInPolicyType.ATTRIBUTES]: { name },
        });
        await expect(evaluator.evaluate({ name: 'node_update', data: data('00000000-0000-4000-8000-000000000002', 'allowed') })).resolves.toBeUndefined();
        await expect(evaluator.evaluate({ name: 'node_update', data: data('00000000-0000-4000-8000-000000000003', 'allowed') })).rejects.toThrow();
        await expect(evaluator.evaluate({ name: 'node_update', data: data('00000000-0000-4000-8000-000000000002', 'denied') })).rejects.toThrow();
        expect(requests).toBe(1);
    });

    it('fails closed when the catalog cannot be loaded', async () => {
        const client = new Client({ baseURL: 'http://authup.test', transport: new MemoryTransport({ fetch: () => ({ status: 403 }) }) });
        await expect(createAuthupPermissionEvaluator(client, { identity, grants: [] })).rejects.toThrow();
    });
});
