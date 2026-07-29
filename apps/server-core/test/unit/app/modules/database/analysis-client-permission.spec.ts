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
import { createAllowAllActor, createDenyAllActor, createFakeAuthupClient } from '@privateaim/server-test-kit';
import { describe, expect, it } from 'vitest';
import { AnalysisClientPermissionService } from '../../../../../src/app/modules/database/analysis-client-permission.ts';
import type { IAnalysisRepository } from '../../../../../src/core/index.ts';

// Driven through a REAL `AuthupClient` on an in-memory transport. Each handler
// answers as the server would for that case, and the assertions check the
// service's OUTGOING contract (the filters it actually put on the wire) rather
// than re-implementing authup's filtering in the double.

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

function permissionHandler(...permissions: { id: string, name: string }[]) {
    return (req: { params: Record<string, string> }) => {
        const permission = permissions.find((entry) => entry.id === req.params.id);
        if (!permission) {
            throw new Error(`permission ${req.params.id} not found`);
        }

        return { data: permission, meta: {} };
    };
}

describe('AnalysisClientPermissionService', () => {
    describe('getMany', () => {
        it('should return the client permissions of the analysis client', async () => {
            const analysis = createAnalysis({ client_id: 'client-1' });
            const authup = createFakeAuthupClient({
                handlers: {
                    'GET /client-permissions': () => ({
                        data: [{
                            id: 'cp-1', 
                            clientId: 'client-1', 
                            permission: { name: STORAGE_PERMISSION.name }, 
                        }],
                        meta: { total: 1 },
                    }),
                },
            });
            const service = new AnalysisClientPermissionService({
                authup,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            const { data } = await service.getMany(analysis.id!, createAllowAllActor());

            expect(data).toHaveLength(1);
            expect(data[0].id).toBe('cp-1');

            // The scoping that keeps other clients' rows out is the FILTER the
            // service sends — assert that, not a re-implementation of it.
            const query = decodeURIComponent(authup.requests[0].url);
            expect(query).toContain('client-1');
            expect(query).toContain('permission');
        });

        it('should return empty without calling authup when no client is provisioned', async () => {
            const analysis = createAnalysis({ client_id: null });
            const authup = createFakeAuthupClient();
            const service = new AnalysisClientPermissionService({
                authup,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            const { data, meta } = await service.getMany(analysis.id!, createAllowAllActor());

            expect(data).toHaveLength(0);
            expect(meta.total).toBe(0);
            expect(authup.requests).toHaveLength(0);
        });
    });

    describe('create', () => {
        it('should grant a self-capability', async () => {
            const analysis = createAnalysis({ client_id: 'client-1' });
            const authup = createFakeAuthupClient({
                handlers: {
                    'GET /permissions/:id': permissionHandler(STORAGE_PERMISSION),
                    'POST /client-permissions': (req) => ({ data: { id: 'cp-1', ...(req.body as object) }, meta: {} }),
                },
            });
            const service = new AnalysisClientPermissionService({
                authup,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            await service.create(analysis.id!, { permission_id: STORAGE_PERMISSION.id }, createAllowAllActor());

            const created = authup.requests.filter((request) => request.method === 'POST');
            expect(created).toHaveLength(1);
            expect(created[0].body).toMatchObject({
                clientId: 'client-1',
                permissionId: STORAGE_PERMISSION.id,
            });
        });

        it('should reject a permission outside the analysis-self family', async () => {
            const analysis = createAnalysis();
            const authup = createFakeAuthupClient({ handlers: { 'GET /permissions/:id': permissionHandler(APPROVE_PERMISSION) } });
            const service = new AnalysisClientPermissionService({
                authup,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            await expect(
                service.create(analysis.id!, { permission_id: APPROVE_PERMISSION.id }, createAllowAllActor()),
            ).rejects.toThrow(PermissionDeniedError);
            expect(authup.requests.filter((request) => request.method === 'POST')).toHaveLength(0);
        });

        it('should reject when the analysis configuration is locked', async () => {
            const analysis = createAnalysis({ configuration_locked: true });
            const authup = createFakeAuthupClient({ handlers: { 'GET /permissions/:id': permissionHandler(STORAGE_PERMISSION) } });
            const service = new AnalysisClientPermissionService({
                authup,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            await expect(
                service.create(analysis.id!, { permission_id: STORAGE_PERMISSION.id }, createAllowAllActor()),
            ).rejects.toThrow(BadRequestError);
        });

        it('should reject when the analysis has no client provisioned', async () => {
            const analysis = createAnalysis({ client_id: null });
            const authup = createFakeAuthupClient({ handlers: { 'GET /permissions/:id': permissionHandler(STORAGE_PERMISSION) } });
            const service = new AnalysisClientPermissionService({
                authup,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            await expect(
                service.create(analysis.id!, { permission_id: STORAGE_PERMISSION.id }, createAllowAllActor()),
            ).rejects.toThrow(BadRequestError);
        });

        it('should reject without a permission_id', async () => {
            const analysis = createAnalysis();
            const authup = createFakeAuthupClient();
            const service = new AnalysisClientPermissionService({
                authup,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            await expect(
                service.create(analysis.id!, {}, createAllowAllActor()),
            ).rejects.toThrow(BadRequestError);
        });

        it('should deny without permission', async () => {
            const analysis = createAnalysis();
            const authup = createFakeAuthupClient({ handlers: { 'GET /permissions/:id': permissionHandler(STORAGE_PERMISSION) } });
            const service = new AnalysisClientPermissionService({
                authup,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            await expect(
                service.create(analysis.id!, { permission_id: STORAGE_PERMISSION.id }, createDenyAllActor()),
            ).rejects.toThrow();
            expect(authup.requests.filter((request) => request.method === 'POST')).toHaveLength(0);
        });

        it('should 404 for an unknown analysis', async () => {
            const authup = createFakeAuthupClient();
            const service = new AnalysisClientPermissionService({
                authup,
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
            const authup = createFakeAuthupClient({
                handlers: {
                    'GET /client-permissions': () => ({
                        data: [{
                            id: 'cp-1', 
                            clientId: 'client-1', 
                            permissionId: STORAGE_PERMISSION.id, 
                        }],
                        meta: { total: 1 },
                    }),
                    'DELETE /client-permissions/:id': (req) => ({ data: { id: req.params.id }, meta: {} }),
                },
            });
            const service = new AnalysisClientPermissionService({
                authup,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            await service.delete(analysis.id!, STORAGE_PERMISSION.id, createAllowAllActor());

            const deleted = authup.requests.filter((request) => request.method === 'DELETE');
            expect(deleted).toHaveLength(1);
            expect(deleted[0].params.id).toBe('cp-1');

            // The lookup must be scoped by BOTH the client and the permission.
            const query = decodeURIComponent(authup.requests[0].url);
            expect(query).toContain('client-1');
            expect(query).toContain(STORAGE_PERMISSION.id);
        });

        it('should 404 when no matching client permission exists', async () => {
            const analysis = createAnalysis({ client_id: 'client-1' });
            const authup = createFakeAuthupClient({ handlers: { 'GET /client-permissions': () => ({ data: [], meta: { total: 0 } }) } });
            const service = new AnalysisClientPermissionService({
                authup,
                analysisRepository: createAnalysisRepository([analysis]),
            });

            await expect(
                service.delete(analysis.id!, STORAGE_PERMISSION.id, createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
            expect(authup.requests.filter((request) => request.method === 'DELETE')).toHaveLength(0);
        });
    });
});
