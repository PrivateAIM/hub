/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { createAdminAccessToken, createRestrictedAccessToken } from '@privateaim/server-test-kit';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { NodeEntity, RegistryEntity, RegistryProjectEntity } from '../../../src/adapters/database/index.ts';
import { createTestApplication } from '../../app';

/**
 * A `select: false` secret must not be reachable through a relation fieldset.
 * The REGISTRY_MANAGE gates only ever inspected the ROOT fields of their own
 * endpoint, so `include=registry&fields[registry]=+accountSecret` on
 * `/registry-projects` (or the registry/registryProject relations of
 * `/nodes`, and deeper through `node.*` on project- and analysis-nodes)
 * returned the Harbor credentials to any logged-in caller.
 */
describe('nested secret fields', () => {
    const suite = createTestApplication();
    let baseURL: string;

    const REGISTRY_SECRET = `registry-secret-${randomUUID()}`;
    const PROJECT_SECRET = `project-secret-${randomUUID()}`;
    let registryId: string;
    let registryProjectId: string;
    let nodeId: string;

    beforeAll(async () => {
        await suite.setup();
        baseURL = suite.client.getBaseURL().replace(/\/+$/, '');

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
            realmId: randomUUID(),
        });
        registryProjectId = registryProject.id;

        const node = await dataSource.getRepository(NodeEntity).save({
            name: `node-${randomUUID().slice(0, 8)}`,
            externalName: `node-ext-${randomUUID().slice(0, 8)}`,
            realmId: randomUUID(),
            registryId,
            registryProjectId,
        });
        nodeId = node.id;
    });

    afterAll(async () => {
        await suite.teardown();
    });

    const get = async (path: string, token: string) => {
        const response = await fetch(`${baseURL}${path}`, { headers: { authorization: `Bearer ${token}` } });
        return { status: response.status, text: await response.text() };
    };

    it('rejects a registry secret requested through /registry-projects', async () => {
        const response = await get(
            `/registry-projects?filter[id]=${registryProjectId}&include=registry&fields[registry]=%2BaccountSecret`,
            await createRestrictedAccessToken(),
        );

        expect(response.text).not.toContain(REGISTRY_SECRET);
        expect(response.status).toBe(400);
    });

    it('rejects registry and registry-project secrets requested through /nodes', async () => {
        const token = await createRestrictedAccessToken();

        const viaRegistry = await get(
            `/nodes?filter[id]=${nodeId}&include=registry&fields[registry]=%2BaccountSecret`,
            token,
        );
        expect(viaRegistry.text).not.toContain(REGISTRY_SECRET);
        expect(viaRegistry.status).toBe(400);

        const viaProject = await get(
            `/nodes/${nodeId}?include=registryProject&fields[registryProject]=%2BaccountSecret`,
            token,
        );
        expect(viaProject.text).not.toContain(PROJECT_SECRET);
        expect(viaProject.status).toBe(400);
    });

    it('rejects a nested secret even for the admin', async () => {
        // A nested secret is never served: the per-resource gate only reaches
        // the root of its own endpoint, so the relation path is refused for
        // every caller rather than gated per actor.
        const response = await get(
            `/registry-projects?filter[id]=${registryProjectId}&include=registry&fields[registry]=%2BaccountSecret`,
            await createAdminAccessToken(),
        );

        expect(response.text).not.toContain(REGISTRY_SECRET);
        expect(response.status).toBe(400);
    });

    // Negative controls: the relation itself still resolves, and the root
    // secret stays available behind its own gate.
    it('still serves the relation without the secret', async () => {
        const response = await get(
            `/registry-projects?filter[id]=${registryProjectId}&include=registry`,
            await createRestrictedAccessToken(),
        );

        expect(response.status).toBe(200);
        expect(response.text).toContain(registryId);
        expect(response.text).not.toContain(REGISTRY_SECRET);
    });

    it('still serves the root secret to the admin', async () => {
        const response = await get(
            `/registries/${registryId}?fields=%2BaccountSecret`,
            await createAdminAccessToken(),
        );

        expect(response.status).toBe(200);
        expect(response.text).toContain(REGISTRY_SECRET);
    });
});
