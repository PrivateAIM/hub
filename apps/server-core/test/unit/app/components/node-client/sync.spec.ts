/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { createFakeAuthupClient, fakeAuthupResponse } from '@privateaim/server-test-kit';
import { describe, expect, it } from 'vitest';
import { NodeClientService } from '../../../../../src/app/modules/database/node-client.ts';
import { syncNodeClientPermissions } from '../../../../../src/app/components/node-client/index.ts';
import { FakeNodeRepository } from '../../../core/entities/node/fake-repository.ts';

// Driven through a REAL AuthupClient on an in-memory transport, so the grant
// requests travel the hapic pipeline. Unless a test seeds `existing`, Authup
// holds no permissions for any client yet, so every node needs every grant.

const permissions: Record<string, { id: string, name: string }> = {
    [PermissionName.ANALYSIS_UPDATE]: { id: 'perm-analysis-update', name: PermissionName.ANALYSIS_UPDATE },
    [PermissionName.ANALYSIS_READ]: { id: 'perm-analysis-read', name: PermissionName.ANALYSIS_READ },
    [PermissionName.NODE_READ]: { id: 'perm-node-read', name: PermissionName.NODE_READ },
    [PermissionName.ANALYSIS_NODE_LOG_CREATE]: { id: 'perm-node-log-create', name: PermissionName.ANALYSIS_NODE_LOG_CREATE },
};

type ExistingGrant = {
    id: string, 
    permission: { name: string }, 
    realmScope: string 
};

function createRepository(nodes: Partial<Node>[]) {
    const repository = new FakeNodeRepository();
    repository.seed(nodes as Node[]);
    return repository;
}

function createAuthup(options: {
    missing?: string[], 
    failingClients?: string[], 
    existing?: ExistingGrant[] 
} = {}) {
    const existing = options.existing ?? [];

    return createFakeAuthupClient({
        handlers: {
            'GET /client-permissions': () => ({ data: existing, meta: { total: existing.length } }),
            'DELETE /client-permissions/:id': (req) => ({ data: { id: req.params.id }, meta: {} }),
            'GET /permissions/:id': (req) => {
                const permission = permissions[req.params.id];
                if (!permission || options.missing?.includes(req.params.id)) {
                    return fakeAuthupResponse(404, { message: 'not found' });
                }

                return { data: permission, meta: {} };
            },
            'POST /client-permissions': (req) => {
                const body = req.body as { clientId: string, permissionId: string };
                if (options.failingClients?.includes(body.clientId)) {
                    return fakeAuthupResponse(400, { message: 'client does not exist' });
                }

                return { data: { id: `${body.clientId}:${body.permissionId}`, ...body }, meta: {} };
            },
        },
    });
}

function grants(authup: ReturnType<typeof createAuthup>) {
    return authup.requests
        .filter((req) => req.method === 'POST')
        .map((req) => req.body as {
            clientId: string, 
            permissionId: string, 
            realmScope?: string 
        });
}

function revocations(authup: ReturnType<typeof createAuthup>) {
    return authup.requests
        .filter((req) => req.method === 'DELETE')
        .map((req) => req.params.id);
}

describe('syncNodeClientPermissions', () => {
    it('should grant analysis_read, node_read and analysis_node_log_create, scoped none, to every existing node client', async () => {
        const authup = createAuthup();
        const repository = createRepository([
            {
                id: 'node-1', 
                name: 'node-1', 
                clientId: 'client-1', 
            },
            {
                id: 'node-2', 
                name: 'node-2', 
                clientId: 'client-2', 
            },
            {
                id: 'node-3', 
                name: 'node-3', 
                clientId: null, 
            },
        ]);

        const result = await syncNodeClientPermissions({
            repository,
            nodeClientService: new NodeClientService(authup),
        });

        expect(result).toEqual({ synced: 2, failed: 0 });
        expect(grants(authup)).toEqual(['client-1', 'client-2'].flatMap((clientId) => [
            {
                clientId, 
                permissionId: 'perm-analysis-read', 
                realmScope: 'none', 
            },
            {
                clientId, 
                permissionId: 'perm-node-read', 
                realmScope: 'none', 
            },
            {
                clientId, 
                permissionId: 'perm-node-log-create', 
                realmScope: 'none', 
            },
        ]));
    });

    it('should skip a failing node and still sync the others', async () => {
        const authup = createAuthup({ failingClients: ['client-1'] });
        const repository = createRepository([
            {
                id: 'node-1', 
                name: 'node-1', 
                clientId: 'client-1', 
            },
            {
                id: 'node-2', 
                name: 'node-2', 
                clientId: 'client-2', 
            },
        ]);

        const result = await syncNodeClientPermissions({
            repository,
            nodeClientService: new NodeClientService(authup),
        });

        expect(result).toEqual({ synced: 1, failed: 1 });
        expect(grants(authup).filter((g) => g.clientId === 'client-2')).toHaveLength(3);
    });

    it('should report every node as failed when node_read is not provisioned', async () => {
        const authup = createAuthup({ missing: [PermissionName.NODE_READ] });
        const repository = createRepository([
            {
                id: 'node-1', 
                name: 'node-1', 
                clientId: 'client-1', 
            },
        ]);

        const result = await syncNodeClientPermissions({
            repository,
            nodeClientService: new NodeClientService(authup),
        });

        expect(result).toEqual({ synced: 0, failed: 1 });
    });
});

describe('NodeClientService.assignPermissions', () => {
    it('should revoke analysis_update and replace grants scoped other than none', async () => {
        const authup = createAuthup({
            existing: [
                {
                    id: 'cp-update', 
                    permission: { name: PermissionName.ANALYSIS_UPDATE }, 
                    realmScope: 'none', 
                },
                {
                    id: 'cp-read', 
                    permission: { name: PermissionName.ANALYSIS_READ }, 
                    realmScope: 'own', 
                },
                {
                    id: 'cp-node', 
                    permission: { name: PermissionName.NODE_READ }, 
                    realmScope: 'none', 
                },
                {
                    id: 'cp-log', 
                    permission: { name: PermissionName.ANALYSIS_NODE_LOG_CREATE }, 
                    realmScope: 'any', 
                },
            ],
        });

        await new NodeClientService(authup).assignPermissions('client-1');

        // re-scoped grants are replaced first, unneeded ones revoked last
        expect(revocations(authup)).toEqual(['cp-read', 'cp-log', 'cp-update']);
        expect(grants(authup)).toEqual([
            {
                clientId: 'client-1', 
                permissionId: 'perm-analysis-read', 
                realmScope: 'none', 
            },
            {
                clientId: 'client-1', 
                permissionId: 'perm-node-log-create', 
                realmScope: 'none', 
            },
        ]);
    });

    it('should change nothing when every grant is in place and scoped none', async () => {
        const authup = createAuthup({
            existing: [
                {
                    id: 'cp-read', 
                    permission: { name: PermissionName.ANALYSIS_READ }, 
                    realmScope: 'none', 
                },
                {
                    id: 'cp-node', 
                    permission: { name: PermissionName.NODE_READ }, 
                    realmScope: 'none', 
                },
                {
                    id: 'cp-log', 
                    permission: { name: PermissionName.ANALYSIS_NODE_LOG_CREATE }, 
                    realmScope: 'none', 
                },
            ],
        });

        await new NodeClientService(authup).assignPermissions('client-1');

        expect(authup.requests.map((req) => req.method)).toEqual(['GET']);
    });

    it('should leave every existing grant in place when a permission is not provisioned', async () => {
        // the upgrade from v0.18.0: node_read at the default scope plus
        // analysis_update, run before analysis_read exists in Authup
        const authup = createAuthup({
            missing: [PermissionName.ANALYSIS_READ],
            existing: [
                {
                    id: 'cp-update',
                    permission: { name: PermissionName.ANALYSIS_UPDATE },
                    realmScope: 'own',
                },
                {
                    id: 'cp-node',
                    permission: { name: PermissionName.NODE_READ },
                    realmScope: 'own',
                },
            ],
        });

        await expect(new NodeClientService(authup).assignPermissions('client-1'))
            .rejects.toThrow(PermissionName.ANALYSIS_READ);

        expect(revocations(authup)).toEqual([]);
        expect(grants(authup)).toEqual([]);
    });

    it('should throw when a permission is not provisioned in Authup', async () => {
        const authup = createAuthup({ missing: [PermissionName.NODE_READ] });
        const service = new NodeClientService(authup);

        await expect(service.assignPermissions('client-1')).rejects.toThrow(PermissionName.NODE_READ);
    });
});
