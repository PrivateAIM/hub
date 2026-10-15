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
// requests travel the hapic pipeline. Authup holds no permissions for any
// client yet, so every node needs both grants.

const permissions: Record<string, { id: string, name: string }> = {
    [PermissionName.ANALYSIS_UPDATE]: { id: 'perm-analysis-update', name: PermissionName.ANALYSIS_UPDATE },
    [PermissionName.NODE_READ]: { id: 'perm-node-read', name: PermissionName.NODE_READ },
};

function createRepository(nodes: Partial<Node>[]) {
    const repository = new FakeNodeRepository();
    repository.seed(nodes as Node[]);
    return repository;
}

function createAuthup(options: { missing?: string[], failingClients?: string[] } = {}) {
    return createFakeAuthupClient({
        handlers: {
            'GET /client-permissions': () => ({ data: [], meta: { total: 0 } }),
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
        .map((req) => req.body as { clientId: string, permissionId: string });
}

describe('syncNodeClientPermissions', () => {
    it('should grant node_read and analysis_update to every existing node client', async () => {
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
        expect(grants(authup)).toEqual([
            { clientId: 'client-1', permissionId: 'perm-analysis-update' },
            { clientId: 'client-1', permissionId: 'perm-node-read' },
            { clientId: 'client-2', permissionId: 'perm-analysis-update' },
            { clientId: 'client-2', permissionId: 'perm-node-read' },
        ]);
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
        expect(grants(authup).filter((g) => g.clientId === 'client-2')).toHaveLength(2);
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
    it('should throw when a permission is not provisioned in Authup', async () => {
        const authup = createAuthup({ missing: [PermissionName.NODE_READ] });
        const service = new NodeClientService(authup);

        await expect(service.assignPermissions('client-1')).rejects.toThrow(PermissionName.NODE_READ);
    });
});
