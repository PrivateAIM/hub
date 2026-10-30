/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { PermissionName } from '@privateaim/kit';
import { createAdminAccessToken, createRestrictedAccessToken } from '@privateaim/server-test-kit';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { RegistryEntity, RegistryProjectEntity } from '../../../src/adapters/database/index.ts';
import { createTestApplication } from '../../app';

/**
 * A `select: false` secret must not be reachable through a relation fieldset.
 * The REGISTRY_MANAGE gates only ever inspected the ROOT fields of their own
 * endpoint, so `include=registry&fields[registry]=+accountSecret` on
 * `/registry-projects` returned the Harbor credentials to any logged-in caller.
 * The registry schemas now keep the field root-only, so the nested request is
 * answered without it (the other relation paths are pinned at decode level in
 * `core/query/nested-secret-field.spec.ts`).
 */
describe('nested secret fields', () => {
    const suite = createTestApplication();
    let baseURL: string;

    const REGISTRY_SECRET = `registry-secret-${randomUUID()}`;
    const PROJECT_SECRET = `project-secret-${randomUUID()}`;
    let registryId: string;
    let registryProjectId: string;

    beforeAll(async () => {
        await suite.setup();
        baseURL = suite.client.getBaseURL().replace(/\/+$/, '');

        // The restricted caller's read reach is its own (master) realm, so the
        // project has to live there to be listed at all.
        const authupURL = process.env.AUTHUP_URL.replace(/\/+$/, '');
        const headers = { authorization: `Bearer ${await createAdminAccessToken()}` };
        const masterRealms = await fetch(`${authupURL}/realms?filter[name]=master`, { headers }).then((r) => r.json());

        const { dataSource } = suite;
        const registry = await dataSource.getRepository(RegistryEntity).save({
            name: `registry-${randomUUID().slice(0, 8)}`,
            host: 'harbor.example.com',
            accountName: 'admin',
            accountSecret: REGISTRY_SECRET,
        });

        registryId = registry.id;

        const registryProject = await dataSource.getRepository(RegistryProjectEntity).save({
            name: `project-${randomUUID().slice(0, 8)}`,
            externalName: `ext-${randomUUID().slice(0, 8)}`,
            registryId,
            accountName: 'robot',
            accountSecret: PROJECT_SECRET,
            realmId: masterRealms.data[0].id,
        });

        registryProjectId = registryProject.id;
    });

    afterAll(async () => {
        // Spec files share one database per vitest worker, so leave nothing
        // behind: a stray registry turns the default-registry lookup of every
        // later spec in this worker non-empty (registry/adapter.spec.ts).
        // Guarded: a `delete({ id: undefined })` after a failed setup would
        // not be a no-op.
        try {
            const { dataSource } = suite;

            if (registryProjectId) {
                await dataSource.getRepository(RegistryProjectEntity).delete({ id: registryProjectId });
            }

            if (registryId) {
                await dataSource.getRepository(RegistryEntity).delete({ id: registryId });
            }
        } finally {
            await suite.teardown();
        }
    });

    const get = async (path: string, token: string) => {
        const response = await fetch(`${baseURL}${path}`, { headers: { authorization: `Bearer ${token}` } });

        return { status: response.status, text: await response.text() };
    };

    it.each([
        // Reading the collection itself needs the read grant.
        ['a restricted user', () => createRestrictedAccessToken([PermissionName.REGISTRY_PROJECT_READ, PermissionName.REGISTRY_READ])],
        // The per-resource gate only reaches the root of its own endpoint, so
        // the relation path is closed for every caller, not gated per actor.
        ['the admin', createAdminAccessToken],
    ])('does not serve a registry secret through /registry-projects to %s', async (_label, createToken) => {
        const response = await get(
            `/registry-projects?filter[id]=${registryProjectId}&include=registry&fields[registry]=%2BaccountSecret`,
            await createToken(),
        );

        expect(response.status).toBe(200);
        expect(response.text).toContain(registryId);
        expect(response.text).not.toContain(REGISTRY_SECRET);
    });

    // Negative control: the root secret stays available behind its own gate.
    it('still serves the root secret to the admin', async () => {
        const response = await get(
            `/registries/${registryId}?fields=%2BaccountSecret`,
            await createAdminAccessToken(),
        );

        expect(response.status).toBe(200);
        expect(response.text).toContain(REGISTRY_SECRET);
    });
});
