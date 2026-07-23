/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { ClientAuthMethod } from '@authup/core-kit';
import { PermissionName } from '@privateaim/kit';
import type { AuthupClient } from '@privateaim/server-kit';
import { describe, expect, it } from 'vitest';
import { AnalysisClientService } from '../../../../../src/app/modules/database/analysis-client.ts';

type ClientPermissionRecord = { id: string; permission: { name: string } };

/**
 * In-memory fake of the parts of AuthupClient the AnalysisClientService touches.
 * Records calls so assertions can verify create/reuse/dismiss and the additive
 * (never-delete) permission behaviour.
 */
class FakeAuthupClient {
    public createdClients: Record<string, any>[] = [];

    public deletedClientIds: string[] = [];

    public createdClientPermissions: Record<string, any>[] = [];

    public deletedClientPermissionIds: string[] = [];

    private existingClients = new Map<string, { id: string }>();

    private existingClientPermissions: ClientPermissionRecord[] = [];

    private knownPermissions = new Set<string>();

    private clientSeq = 0;

    constructor(opts: {
        permissions?: string[];
        existingClient?: { id: string };
        existingClientPermissions?: ClientPermissionRecord[];
    } = {}) {
        for (const name of opts.permissions || []) {
            this.knownPermissions.add(name);
        }
        if (opts.existingClient) {
            this.existingClients.set(opts.existingClient.id, opts.existingClient);
        }
        if (opts.existingClientPermissions) {
            this.existingClientPermissions = opts.existingClientPermissions;
        }
    }

    client = {
        create: async (data: Record<string, any>) => {
            this.clientSeq += 1;
            const client = { id: `client-${this.clientSeq}` };
            this.createdClients.push(data);
            this.existingClients.set(client.id, client);
            return client;
        },
        getOne: async (id: string) => {
            const client = this.existingClients.get(id);
            if (!client) {
                throw new Error(`client ${id} not found`);
            }
            return client;
        },
        delete: async (id: string) => {
            this.deletedClientIds.push(id);
            this.existingClients.delete(id);
            return { id };
        },
    };

    clientPermission = {
        getMany: async () => ({ data: this.existingClientPermissions }),
        create: async (data: Record<string, any>) => {
            this.createdClientPermissions.push(data);
            return { id: `cp-${this.createdClientPermissions.length}`, ...data };
        },
        delete: async (id: string) => {
            this.deletedClientPermissionIds.push(id);
            return { id };
        },
    };

    permission = {
        getOne: async (name: string) => {
            if (!this.knownPermissions.has(name)) {
                throw new Error(`permission ${name} not found`);
            }
            return { id: `perm-${name}`, name };
        },
    };
}

function createAnalysisEntity(overrides: Record<string, any> = {}) {
    return {
        id: randomUUID(),
        client_id: null,
        realm_id: randomUUID(),
        ...overrides,
    } as any;
}

describe('AnalysisClientService', () => {
    describe('assign', () => {
        it('should create a confidential client and store its id when none exists', async () => {
            const authup = new FakeAuthupClient();
            const service = new AnalysisClientService(authup as unknown as AuthupClient);

            const entity = createAnalysisEntity();
            const client = await service.assign(entity);

            expect(authup.createdClients).toHaveLength(1);
            expect(authup.createdClients[0]).toMatchObject({
                name: entity.id,
                realmId: entity.realm_id,
                authMethod: ClientAuthMethod.SECRET,
            });
            expect(client.id).toBe('client-1');
            expect(entity.client_id).toBe('client-1');
        });

        it('should reuse an existing client without creating a new one', async () => {
            const authup = new FakeAuthupClient({ existingClient: { id: 'client-existing' } });
            const service = new AnalysisClientService(authup as unknown as AuthupClient);

            const entity = createAnalysisEntity({ client_id: 'client-existing' });
            const client = await service.assign(entity);

            expect(authup.createdClients).toHaveLength(0);
            expect(client.id).toBe('client-existing');
            expect(entity.client_id).toBe('client-existing');
        });
    });

    describe('dismiss', () => {
        it('should delete the client and clear the id', async () => {
            const authup = new FakeAuthupClient({ existingClient: { id: 'client-x' } });
            const service = new AnalysisClientService(authup as unknown as AuthupClient);

            const entity = createAnalysisEntity({ client_id: 'client-x' });
            await service.dismiss(entity);

            expect(authup.deletedClientIds).toEqual(['client-x']);
            expect(entity.client_id).toBeNull();
        });

        it('should be a no-op when there is no client_id', async () => {
            const authup = new FakeAuthupClient();
            const service = new AnalysisClientService(authup as unknown as AuthupClient);

            const entity = createAnalysisEntity({ client_id: null });
            await service.dismiss(entity);

            expect(authup.deletedClientIds).toHaveLength(0);
        });
    });

    describe('assignDefaultPermissions', () => {
        it('should grant both self-capabilities to a client with none', async () => {
            const authup = new FakeAuthupClient({
                permissions: [
                    PermissionName.ANALYSIS_SELF_STORAGE_USE,
                    PermissionName.ANALYSIS_SELF_MESSAGE_BROKER_USE,
                ],
            });
            const service = new AnalysisClientService(authup as unknown as AuthupClient);

            await service.assignDefaultPermissions({ id: 'client-1' } as any);

            const created = authup.createdClientPermissions.map((cp) => cp.permissionId);
            expect(created).toContain(`perm-${PermissionName.ANALYSIS_SELF_STORAGE_USE}`);
            expect(created).toContain(`perm-${PermissionName.ANALYSIS_SELF_MESSAGE_BROKER_USE}`);
            expect(authup.createdClientPermissions).toHaveLength(2);
        });

        it('should additively add only the missing permission and never delete', async () => {
            const authup = new FakeAuthupClient({
                permissions: [
                    PermissionName.ANALYSIS_SELF_STORAGE_USE,
                    PermissionName.ANALYSIS_SELF_MESSAGE_BROKER_USE,
                ],
                existingClientPermissions: [
                    { id: 'cp-existing', permission: { name: PermissionName.ANALYSIS_SELF_STORAGE_USE } },
                ],
            });
            const service = new AnalysisClientService(authup as unknown as AuthupClient);

            await service.assignDefaultPermissions({ id: 'client-1' } as any);

            expect(authup.createdClientPermissions).toHaveLength(1);
            expect(authup.createdClientPermissions[0].permissionId).toBe(`perm-${PermissionName.ANALYSIS_SELF_MESSAGE_BROKER_USE}`);
            expect(authup.deletedClientPermissionIds).toHaveLength(0);
        });
    });
});
