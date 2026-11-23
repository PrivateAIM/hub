/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { Client } from '@authup/core-http-kit';
import type { RegistryProject } from '@privateaim/core-kit';
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
import {
    REGISTRY_PROJECT_READ_PERMISSIONS,
    RegistryProjectService,
} from '../../../src/core/entities/registry-project/service.ts';
import { FakeRegistryProjectRepository } from '../core/entities/registry-project/fake-repository.ts';

// A grant whose junction policy authup cannot lower onto a column compiles to
// `post`. This pins, against the real Authup the suite runs, that such a
// verdict really occurs and that a read then returns what the evaluator
// allows per row: not the actor's realm.

const NAME = PermissionName.REGISTRY_PROJECT_READ;

type PolicyInput = {
    invert: boolean,
    names: string[],
};

describe('a post verdict against a real Authup', () => {
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

        return response.json();
    };

    /** A user holding the read at `realmScope`, narrowed by an attribute-names policy. */
    async function createPolicyActor(realmScope: string, policy: PolicyInput): Promise<ActorContext> {
        const name = `post-${realmScope}-${randomUUID().slice(0, 6)}`;
        const password = 'start123start';
        const { data: user } = await request<{ data: { id: string } }>('POST', 'users', {
            name,
            email: `${name}@example.com`,
            password,
            active: true,
        });
        const { data: createdPolicy } = await request<{ data: { id: string } }>('POST', 'policies', {
            name: `${name}-policy`,
            type: 'attributeNames',
            ...policy,
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
            policyId: createdPolicy.id,
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

    function createService(rows: Partial<RegistryProject>[]) {
        const repository = new FakeRegistryProjectRepository();

        for (const row of rows) {
            repository.seed(repository.create(row));
        }

        return new RegistryProjectService({ repository });
    }

    beforeAll(async () => {
        adminToken = await createAdminAccessToken(baseURL);
        catalogClient = new Client({ baseURL });
        catalogClient.setAuthorizationHeader({ type: 'Bearer', token: adminToken });
        verifier = createAuthupTokenVerifier({
            baseURL,
            // The built-in `system` client, as the services introspect.
            client: {
                id: 'system',
                secret: 'start123',
                realm: 'master',
            },
        });

        const { data: realm } = await request<{ data: { id: string } }>('POST', 'realms', { name: `other-${randomUUID().slice(0, 6)}` });

        otherRealmId = realm.id;
    }, 120_000);

    // Inverted over a name no row carries: the policy passes for every row and
    // cannot be lowered, so the realm scope alone decides.
    const PASSING: PolicyInput = { invert: true, names: ['aFieldNoRowCarries'] };

    it('returns the rows of every realm an `any` grant reaches', async () => {
        const actor = await createPolicyActor('any', PASSING);

        await expect(actor.permissionEvaluator.compile({ name: REGISTRY_PROJECT_READ_PERMISSIONS }))
            .resolves.toEqual({ verdict: 'post' });

        const service = createService([
            { id: 'own', realmId: actor.realm.id },
            { id: 'foreign', realmId: otherRealmId },
            { id: 'global', realmId: null },
        ]);

        const result = await service.getMany({}, actor);

        expect(result.data.map((row) => row.id).sort()).toEqual(['foreign', 'global', 'own']);
        await expect(service.getOne('foreign', actor)).resolves.toMatchObject({ id: 'foreign' });
    }, 60_000);

    it('applies the realm scope of an `own` grant per row', async () => {
        const actor = await createPolicyActor('own', PASSING);

        await expect(actor.permissionEvaluator.compile({ name: REGISTRY_PROJECT_READ_PERMISSIONS }))
            .resolves.toEqual({ verdict: 'post' });

        const service = createService([
            { id: 'own', realmId: actor.realm.id },
            { id: 'foreign', realmId: otherRealmId },
            { id: 'global', realmId: null },
        ]);

        const result = await service.getMany({}, actor);

        expect(result.data.map((row) => row.id)).toEqual(['own']);
        // The candidate count: denied rows stay in the total.
        expect(result.meta.total).toEqual(3);
        await expect(service.getOne('foreign', actor)).rejects.toThrow();
    }, 60_000);

    it('leaves out a row of the own realm the policy denies', async () => {
        // Passes only for a row carrying no `accountName`.
        const actor = await createPolicyActor('any', { invert: true, names: ['accountName'] });

        await expect(actor.permissionEvaluator.compile({ name: REGISTRY_PROJECT_READ_PERMISSIONS }))
            .resolves.toEqual({ verdict: 'post' });

        const service = createService([
            { id: 'own-plain', realmId: actor.realm.id },
            {
                id: 'own-account',
                realmId: actor.realm.id,
                accountName: 'robot',
            },
            { id: 'foreign-plain', realmId: otherRealmId },
        ]);

        const result = await service.getMany({}, actor);

        expect(result.data.map((row) => row.id).sort()).toEqual(['foreign-plain', 'own-plain']);
        await expect(service.getOne('own-account', actor)).rejects.toThrow();
    }, 60_000);
});
