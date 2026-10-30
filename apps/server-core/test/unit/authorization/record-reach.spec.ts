/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { hasUnboundedReach, reachesRecord } from '@authup/access';
import { Client } from '@authup/core-http-kit';
import { PermissionName } from '@privateaim/kit';
import type { ActorContext } from '@privateaim/server-kit';
import {
    createAuthupPermissionEvaluator,
    createAuthupUserTokenCreator,
    resolveAuthupPolicySubject,
} from '@privateaim/server-kit';
import { createAuthupTokenVerifier } from '@privateaim/server-http-kit';
import type { AuthupPermissionRow } from '@privateaim/server-test-kit';
import { buildAuthupURL, createAdminAccessToken, selectGlobalPermission } from '@privateaim/server-test-kit';
import {
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';

// Every hub write takes its realm reach from @authup/access's record helpers
// (`evaluateRecord`, `reachesRecord`, …), which rely on authup applying a
// grant's `realm_scope` to the record realm. This pins that against the real
// Authup the suite runs: if it stopped, writes would silently lose their
// reach check.

const NAME = PermissionName.NODE_UPDATE;

// [scope, reaches own realm, other realm, realm-less row, unbounded]
const MATRIX = [
    ['none', false, false, false, false],
    ['own', true, false, false, false],
    ['ownOrNull', true, false, true, false],
    ['any', true, true, true, true],
] as const;

describe('record reach against a real Authup', () => {
    const baseURL = process.env.AUTHUP_URL || '';
    let adminToken: string;
    let catalogClient: Client;
    let verifier: ReturnType<typeof createAuthupTokenVerifier>;
    let otherRealmId: string;

    const request = async <T>(method: string, path: string, body?: Record<string, unknown>): Promise<T> => {
        const response = await fetch(buildAuthupURL(baseURL, path), {
            method,
            headers: { 'content-type': 'application/json', authorization: `Bearer ${adminToken}` },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            throw new Error(`Authup ${method} ${path} failed (${response.status}): ${await response.text()}`);
        }

        return response.json() as Promise<T>;
    };

    async function createScopedActor(realmScope: string): Promise<ActorContext> {
        const name = `scope-${realmScope}-${randomUUID().slice(0, 6)}`;
        const password = 'start123start';
        const { data: user } = await request<{ data: { id: string } }>('POST', 'users', {
            name,
            email: `${name}@example.com`,
            password,
            active: true,
        });
        const { data: rows } = await request<{ data: AuthupPermissionRow[] }>('GET', `permissions?filter[name]=${NAME}`);
        const permission = selectGlobalPermission(rows);

        if (!permission) {
            throw new Error(`${NAME} is not provisioned.`);
        }

        await request('POST', 'user-permissions', {
            userId: user.id,
            permissionId: permission.id,
            realmScope,
        });

        const { access_token: token } = await createAuthupUserTokenCreator({
            baseURL,
            name,
            password,
            realm: 'master',
        })();
        const data = await verifier.verify(token);

        return {
            permissionEvaluator: await createAuthupPermissionEvaluator(catalogClient, resolveAuthupPolicySubject(data)),
            realm: { id: data.realm_id, name: data.realm_name },
        };
    }

    beforeAll(async () => {
        adminToken = await createAdminAccessToken(baseURL);
        catalogClient = new Client({ baseURL });
        catalogClient.setAuthorizationHeader({ type: 'Bearer', token: adminToken });
        verifier = createAuthupTokenVerifier({
            baseURL,
            creator: createAuthupUserTokenCreator({
                baseURL,
                name: 'admin',
                password: 'start123',
                realm: 'master',
            }),
        });

        const { data: realm } = await request<{ data: { id: string } }>('POST', 'realms', { name: `other-${randomUUID().slice(0, 6)}` });

        otherRealmId = realm.id;
    }, 120_000);

    it.each(MATRIX)('applies realm_scope %s', async (realmScope, own, other, realmless, unbounded) => {
        const actor = await createScopedActor(realmScope);

        // The capability pre-gate ignores reach: node clients hold their
        // grants at `none` and still pass it.
        await expect(actor.permissionEvaluator.preEvaluate({ name: NAME })).resolves.toBeUndefined();

        const { permissionEvaluator } = actor;

        await expect(reachesRecord(permissionEvaluator, { name: NAME, realm: actor.realm.id })).resolves.toBe(own);
        await expect(reachesRecord(permissionEvaluator, { name: NAME, realm: otherRealmId })).resolves.toBe(other);
        await expect(reachesRecord(permissionEvaluator, { name: NAME, realm: null })).resolves.toBe(realmless);
        await expect(hasUnboundedReach(permissionEvaluator, NAME)).resolves.toBe(unbounded);
    }, 60_000);
});
