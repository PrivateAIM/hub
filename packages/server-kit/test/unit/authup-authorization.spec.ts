/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthorizationCatalog } from '@authup/access';
import { BuiltInPolicyType, definePolicyData, isPermissionError } from '@authup/access';
import { Client } from '@authup/core-http-kit';
import { MemoryTransport } from 'hapic';
import { describe, expect, it } from 'vitest';
import { createAuthupPermissionEvaluator, resolveAuthupPolicySubject } from '../../src/authup/authorization.ts';

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
        const denial = (promise: Promise<void>) => promise.then(() => undefined, (e: unknown) => e);
        expect(isPermissionError(await denial(evaluator.evaluate({ name: 'node_update', data: data('00000000-0000-4000-8000-000000000003', 'allowed') })))).toBe(true);
        expect(isPermissionError(await denial(evaluator.evaluate({ name: 'node_update', data: data('00000000-0000-4000-8000-000000000002', 'denied') })))).toBe(true);
        expect(requests).toBe(1);
    });

    it('fails closed when the catalog cannot be loaded', async () => {
        const client = new Client({ baseURL: 'http://authup.test', transport: new MemoryTransport({ fetch: () => ({ status: 403 }) }) });
        await expect(createAuthupPermissionEvaluator(client, { identity, grants: [] })).rejects.toThrow();
    });

    describe('policy subject', () => {
        const client = () => new Client({
            baseURL: 'http://authup.test',
            transport: new MemoryTransport({ fetch: () => ({ status: 200, body: catalog }) }),
        });
        const grants = [{ name: 'node_update', realm_scope: 'any' }];

        it('places the identity and its grants for a global-scoped token', async () => {
            const subject = resolveAuthupPolicySubject({
                scopes: ['global', 'openid'], 
                identity, 
                grants, 
            });
            expect(subject.identity).toEqual(identity);

            const evaluator = await createAuthupPermissionEvaluator(client(), subject);
            await expect(evaluator.preEvaluate({ name: 'node_update' })).resolves.toBeUndefined();
        });

        // Scope restricts what the caller can do, never who it is: a token
        // without `global` keeps its identity but gets NO grants. Hub used to
        // pass the grants unconditionally, so a narrowly-scoped token was
        // evaluated with its full grants.
        it('keeps the identity but withholds the grants for a token without global scope', async () => {
            const subject = resolveAuthupPolicySubject({
                scopes: ['openid'],
                identity,
                grants,
            });
            expect(subject).toEqual({ identity, grants: [] });

            const evaluator = await createAuthupPermissionEvaluator(client(), subject);
            // A permission DENIAL specifically (answered 403), not just any
            // throw: a TypeError or validation error here would answer 500.
            const error = await evaluator.preEvaluate({ name: 'node_update' }).then(() => undefined, (e: unknown) => e);
            expect(isPermissionError(error)).toBe(true);
        });

        it('keeps the identity for a token without any scope', () => {
            expect(resolveAuthupPolicySubject({
                scopes: [],
                identity,
                grants,
            })).toEqual({ identity, grants: [] });
        });

        // A definition whose only policy READS the identity (no binding
        // policy) must evaluate against the real caller. Had the identity been
        // removed along with the grants, the identity policy would see nobody
        // and deny a user the definition explicitly admits.
        it('evaluates an identity-only policy against the real identity of a non-global token', async () => {
            const identityCatalog: AuthorizationCatalog = {
                permissions: [{
                    name: 'user_only',
                    realm_id: null,
                    client_id: null,
                    decision_strategy: null,
                    policies: ['users'],
                }],
                policies: { users: { type: 'identity', types: ['user'] } },
            };
            const identityClient = new Client({
                baseURL: 'http://authup.test',
                transport: new MemoryTransport({ fetch: () => ({ status: 200, body: identityCatalog }) }),
            });

            const subject = resolveAuthupPolicySubject({
                scopes: ['openid'],
                identity,
                grants: [],
            });
            const evaluator = await createAuthupPermissionEvaluator(identityClient, subject);
            await expect(evaluator.evaluate({ name: 'user_only' })).resolves.toBeUndefined();

            // Negative control: the same definition denies a client identity,
            // so the pass above is the identity being read, not a vacuous allow.
            const clientEvaluator = await createAuthupPermissionEvaluator(identityClient, resolveAuthupPolicySubject({
                scopes: ['openid'],
                identity: { ...identity, type: 'client' as const },
                grants: [],
            }));
            const error = await clientEvaluator.evaluate({ name: 'user_only' }).then(() => undefined, (e: unknown) => e);
            expect(isPermissionError(error)).toBe(true);
        });
    });
});
