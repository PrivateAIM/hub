/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { ClientAuthMethod } from '@authup/core-kit';
import { Client as AuthupClient } from '@authup/core-http-kit';
import type { Node } from '@privateaim/core-kit';
import {
    createAdminAccessToken,
    createClientAccessToken,
    createRestrictedAccessToken,
} from '@privateaim/server-test-kit';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { NodeEntity } from '../../../src/adapters/database/entities/index.ts';
import { createTestApplication } from '../../app';
import { createTestNode } from '../../utils/domains';

/**
 * A node reports its components through its own Authup client; only that
 * client may write, and the stored rows are read like nodes.
 */
describe('node status reporting', () => {
    const suite = createTestApplication();
    let baseURL: string;

    let node: Node;
    let nodeToken: string;
    let otherNodeToken: string;
    let adminToken: string;

    /**
     * The test app does not provision node clients (its NodeSubscriber has no
     * Authup client service), so bind one the way NodeClientService does:
     * a secret client in the node's realm, stored on `node.clientId`.
     */
    async function createNodeWithToken(): Promise<[Node, string]> {
        const { name, externalName } = createTestNode();
        const { data: entity } = await suite.client.node.create({ name, externalName });

        const authup = new AuthupClient({ baseURL: process.env.AUTHUP_URL });

        authup.setAuthorizationHeader({ type: 'Bearer', token: adminToken });

        const secret = randomUUID();
        const { data: client } = await authup.client.create({
            name: entity.id,
            realmId: entity.realmId,
            authMethod: ClientAuthMethod.SECRET,
            secret,
        });

        await suite.dataSource.getRepository(NodeEntity).save({ ...entity, clientId: client.id });

        const token = await createClientAccessToken(client.id, secret, entity.realmId);

        return [entity, token];
    }

    const request = (
        method: string,
        path: string,
        token: string,
        body?: unknown,
    ) => fetch(`${baseURL}${path}`, {
        method,
        headers: {
            authorization: `Bearer ${token}`,
            ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    const validReport = { components: [{ name: 'storage', status: 'ok' }] };

    beforeAll(async () => {
        await suite.setup();
        baseURL = suite.client.getBaseURL().replace(/\/+$/, '');
        adminToken = await createAdminAccessToken();

        [node, nodeToken] = await createNodeWithToken();
        [, otherNodeToken] = await createNodeWithToken();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    it('accepts a full report from the node client', async () => {
        const response = await request('PUT', `/nodes/${node.id}/status`, nodeToken, {
            deployment: { name: 'flame-node', version: '1.1.0' },
            components: [{
                name: 'hub-adapter', 
                status: 'ok', 
                version: '0.3.0', 
            }],
        });

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body.meta).toEqual({ total: 1 });
        expect(body.data).toHaveLength(1);
        expect(body.data[0]).toMatchObject({
            nodeId: node.id,
            name: 'hub-adapter',
            status: 'ok',
            version: '0.3.0',
        });

        const { data } = await suite.client.node.getOne(node.id);

        expect(data.online).toBe(true);
        expect(data.deploymentVersion).toBe('1.1.0');
    });

    it('accepts a single component report from the node client', async () => {
        const response = await request('PUT', `/nodes/${node.id}/components/storage/status`, nodeToken, {
            status: 'ok',
            version: '0.5.1',
        });

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body.meta).toEqual({});
        expect(body.data).toMatchObject({
            nodeId: node.id,
            name: 'storage',
            status: 'ok',
            version: '0.5.1',
        });
    });

    it('refuses a report from an admin user', async () => {
        const response = await request('PUT', `/nodes/${node.id}/status`, adminToken, validReport);

        expect(response.status).toBe(403);
    });

    it('refuses a report from another node client', async () => {
        const response = await request('PUT', `/nodes/${node.id}/status`, otherNodeToken, validReport);

        expect(response.status).toBe(403);
    });

    it('answers 404 for an unknown node', async () => {
        const response = await request(
            'PUT',
            '/nodes/00000000-0000-4000-8000-000000000000/status',
            nodeToken,
            validReport,
        );

        expect(response.status).toBe(404);
    });

    it('rejects an invalid component name', async () => {
        const response = await request('PUT', `/nodes/${node.id}/components/Bad%20Name/status`, nodeToken, { status: 'ok' });

        expect(response.status).toBe(400);
    });

    it('rejects an invalid body', async () => {
        const response = await request('PUT', `/nodes/${node.id}/status`, nodeToken, { components: [{ name: 'x', status: 'unknown' }] });

        expect(response.status).toBe(400);
    });

    it('lists the components of a node', async () => {
        const response = await request(
            'GET',
            `/node-components?filter[nodeId]=${node.id}&filter[name]=storage`,
            adminToken,
        );

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body.data).toHaveLength(1);
        expect(body.data[0]).toMatchObject({ nodeId: node.id, name: 'storage' });
        expect(body.meta.total).toBe(1);
        expect(body.meta.schema.name).toBe('nodeComponent');
    });

    it('refuses the collection to an identity holding no node read grant', async () => {
        const response = await request('GET', '/node-components', await createRestrictedAccessToken());

        expect(response.status).toBe(403);
    });
});
