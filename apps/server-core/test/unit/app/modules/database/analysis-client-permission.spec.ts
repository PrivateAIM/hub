/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Analysis } from '@privateaim/core-kit';
import { PermissionName } from '@privateaim/kit';
import { BadRequestError, EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import type { AuthupClient } from '@privateaim/server-kit';
import { createAllowAllActor, createDenyAllActor } from '@privateaim/server-test-kit';
import { describe, expect, it } from 'vitest';
import { AnalysisClientPermissionService } from '../../../../../src/app/modules/database/analysis-client-permission.ts';
import type { IAnalysisRepository } from '../../../../../src/core/index.ts';

type ClientPermissionRecord = {
    id: string;
    client_id: string;
    permission_id?: string;
    permission?: { name: string };
};

class FakeAuthupClient {
    public createdClientPermissions: Record<string, any>[] = [];

    public deletedClientPermissionIds: string[] = [];

    private clientPermissions: ClientPermissionRecord[];

    private permissions: Map<string, { id: string; name: string }>;

    private seq = 0;

    constructor(opts: {
        permissions?: { id: string; name: string }[];
        clientPermissions?: ClientPermissionRecord[];
    } = {}) {
        this.permissions = new Map((opts.permissions || []).map((p) => [p.id, p]));
        this.clientPermissions = opts.clientPermissions || [];
    }

    clientPermission = {
        getMany: async (query: { filter?: Record<string, any> } = {}) => {
            let data = this.clientPermissions;
            const filter = query.filter || {};
            if (filter.client_id) {
                data = data.filter((cp) => cp.client_id === filter.client_id);
            }
            if (filter.permission_id) {
                data = data.filter((cp) => cp.permission_id === filter.permission_id);
            }
            return { data, meta: { total: data.length } };
        },
        create: async (data: Record<string, any>) => {
            this.seq += 1;
            const record = { id: `cp-${this.seq}`, ...data };
            this.createdClientPermissions.push(data);
            this.clientPermissions.push(record as ClientPermissionRecord);
            return record;
        },
        delete: async (id: string) => {
            this.deletedClientPermissionIds.push(id);
            return { id };
        },
    };

    permission = {
        getOne: async (id: string) => {
            const permission = this.permissions.get(id);
            if (!permission) {
                throw new Error(`permission ${id} not found`);
            }
            return permission;
        },
    };
}

function createAnalysisRepository(analyses: Partial<Analysis>[]): IAnalysisRepository {
    return { findOneById: async (id: string) => analyses.find((a) => a.id === id) ?? null } as unknown as IAnalysisRepository;
}

function createAnalysis(overrides: Partial<Analysis> = {}): Partial<Analysis> {
    return {
        id: randomUUID(),
        realm_id: randomUUID(),
        client_id: 'client-1',
        configuration_locked: false,
        ...overrides,
    };
}

const STORAGE_PERMISSION = { id: 'perm-storage', name: PermissionName.ANALYSIS_SELF_STORAGE_USE };
const APPROVE_PERMISSION = { id: 'perm-approve', name: PermissionName.ANALYSIS_APPROVE };

describe('AnalysisClientPermissionService', () => {
    describe('getMany', () => {
        it('should return the client permissions of the analysis client', async () => {
            const analysis = createAnalysis({ client_id: 'client-1' });
            const authup = new FakeAuthupClient({
                clientPermissions: [
                    {
                        id: 'cp-1', 
                        client_id: 'client-1', 
                        permission: { name: STORAGE_PERMISSION.name }, 
                    },
                    {
                        id: 'cp-2', 
                        client_id: 'other', 
                        permission: { name: STORAGE_PERMISSION.name }, 
                    },
                ],
            });
            const service = new AnalysisClientPermissionService({
                authup: authup as unknown as AuthupClient,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            const { data } = await service.getMany(analysis.id!, createAllowAllActor());
            expect(data).toHaveLength(1);
            expect(data[0].id).toBe('cp-1');
        });

        it('should return empty when no client is provisioned', async () => {
            const analysis = createAnalysis({ client_id: null });
            const authup = new FakeAuthupClient();
            const service = new AnalysisClientPermissionService({
                authup: authup as unknown as AuthupClient,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            const { data, meta } = await service.getMany(analysis.id!, createAllowAllActor());
            expect(data).toHaveLength(0);
            expect(meta.total).toBe(0);
        });
    });

    describe('create', () => {
        it('should grant a self-capability', async () => {
            const analysis = createAnalysis({ client_id: 'client-1' });
            const authup = new FakeAuthupClient({ permissions: [STORAGE_PERMISSION] });
            const service = new AnalysisClientPermissionService({
                authup: authup as unknown as AuthupClient,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            await service.create(analysis.id!, { permission_id: STORAGE_PERMISSION.id }, createAllowAllActor());

            expect(authup.createdClientPermissions).toHaveLength(1);
            expect(authup.createdClientPermissions[0]).toMatchObject({
                client_id: 'client-1',
                permission_id: STORAGE_PERMISSION.id,
            });
        });

        it('should reject a permission outside the analysis-self family', async () => {
            const analysis = createAnalysis();
            const authup = new FakeAuthupClient({ permissions: [APPROVE_PERMISSION] });
            const service = new AnalysisClientPermissionService({
                authup: authup as unknown as AuthupClient,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            await expect(
                service.create(analysis.id!, { permission_id: APPROVE_PERMISSION.id }, createAllowAllActor()),
            ).rejects.toThrow(PermissionDeniedError);
            expect(authup.createdClientPermissions).toHaveLength(0);
        });

        it('should reject when the analysis configuration is locked', async () => {
            const analysis = createAnalysis({ configuration_locked: true });
            const authup = new FakeAuthupClient({ permissions: [STORAGE_PERMISSION] });
            const service = new AnalysisClientPermissionService({
                authup: authup as unknown as AuthupClient,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            await expect(
                service.create(analysis.id!, { permission_id: STORAGE_PERMISSION.id }, createAllowAllActor()),
            ).rejects.toThrow(BadRequestError);
        });

        it('should reject without a permission_id', async () => {
            const analysis = createAnalysis();
            const authup = new FakeAuthupClient();
            const service = new AnalysisClientPermissionService({
                authup: authup as unknown as AuthupClient,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            await expect(
                service.create(analysis.id!, {}, createAllowAllActor()),
            ).rejects.toThrow(BadRequestError);
        });

        it('should deny without permission', async () => {
            const analysis = createAnalysis();
            const authup = new FakeAuthupClient({ permissions: [STORAGE_PERMISSION] });
            const service = new AnalysisClientPermissionService({
                authup: authup as unknown as AuthupClient,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            await expect(
                service.create(analysis.id!, { permission_id: STORAGE_PERMISSION.id }, createDenyAllActor()),
            ).rejects.toThrow();
            expect(authup.createdClientPermissions).toHaveLength(0);
        });

        it('should 404 for an unknown analysis', async () => {
            const authup = new FakeAuthupClient();
            const service = new AnalysisClientPermissionService({
                authup: authup as unknown as AuthupClient,
                analysisRepository: createAnalysisRepository([]),
            });

            await expect(
                service.create(randomUUID(), { permission_id: STORAGE_PERMISSION.id }, createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });
    });

    describe('delete', () => {
        it('should remove the matching client permission', async () => {
            const analysis = createAnalysis({ client_id: 'client-1' });
            const authup = new FakeAuthupClient({
                clientPermissions: [
                    {
                        id: 'cp-1', 
                        client_id: 'client-1', 
                        permission_id: STORAGE_PERMISSION.id, 
                    },
                ],
            });
            const service = new AnalysisClientPermissionService({
                authup: authup as unknown as AuthupClient,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            await service.delete(analysis.id!, STORAGE_PERMISSION.id, createAllowAllActor());
            expect(authup.deletedClientPermissionIds).toEqual(['cp-1']);
        });

        it('should 404 when no matching client permission exists', async () => {
            const analysis = createAnalysis({ client_id: 'client-1' });
            const authup = new FakeAuthupClient({ clientPermissions: [] });
            const service = new AnalysisClientPermissionService({
                authup: authup as unknown as AuthupClient,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            await expect(
                service.delete(analysis.id!, STORAGE_PERMISSION.id, createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });
    });
});
