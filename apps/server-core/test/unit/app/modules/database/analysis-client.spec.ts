/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Client } from '@authup/core-kit';
import { ClientAuthMethod } from '@authup/core-kit';
import { PermissionName } from '@privateaim/kit';
import { createFakeAuthupClient, fakeAuthupResponse } from '@privateaim/server-test-kit';
import { describe, expect, it } from 'vitest';
import type { AnalysisEntity } from '../../../../../src/adapters/database/entities/index.ts';
import { AnalysisClientService } from '../../../../../src/app/modules/database/analysis-client.ts';

// Driven through a REAL `AuthupClient` on an in-memory transport. That matters
// here specifically: this service branches on
// `isClientErrorWithStatusCode(e, 404)`, which needs a genuine hapic
// `ClientError` — a hand-written double throwing `new Error()` can never
// produce one, so those branches used to be unreachable in tests.

// The single narrowing cast lives in this factory: an AnalysisEntity has far
// more columns than the service reads.
function createAnalysisEntity(overrides: Partial<AnalysisEntity> = {}) : AnalysisEntity {
    return {
        id: randomUUID(),
        clientId: null,
        realmId: randomUUID(),
        ...overrides,
    } as AnalysisEntity;
}

function bodiesOf(authup: ReturnType<typeof createFakeAuthupClient>, method: string, pathFragment: string) {
    return authup.requests
        .filter((request) => request.method === method && request.url.includes(pathFragment))
        .map((request) => request.body as Record<string, any>);
}

describe('AnalysisClientService', () => {
    describe('assign', () => {
        it('should create a confidential client and store its id when none exists', async () => {
            const authup = createFakeAuthupClient({ handlers: { 'POST /clients': () => ({ data: { id: 'client-1' }, meta: {} }) } });
            const service = new AnalysisClientService(authup);

            const entity = createAnalysisEntity();
            const client = await service.assign(entity);

            const created = bodiesOf(authup, 'POST', '/clients');
            expect(created).toHaveLength(1);
            expect(created[0]).toMatchObject({
                name: entity.id,
                realmId: entity.realmId,
                authMethod: ClientAuthMethod.SECRET,
            });
            expect(client.id).toBe('client-1');
            expect(entity.clientId).toBe('client-1');
        });

        it('should reuse an existing client without creating a new one', async () => {
            const authup = createFakeAuthupClient({ handlers: { 'GET /clients/:id': (req) => ({ data: { id: req.params.id }, meta: {} }) } });
            const service = new AnalysisClientService(authup);

            const entity = createAnalysisEntity({ clientId: 'client-existing' });
            const client = await service.assign(entity);

            expect(bodiesOf(authup, 'POST', '/clients')).toHaveLength(0);
            expect(client.id).toBe('client-existing');
            expect(entity.clientId).toBe('client-existing');
        });

        it('should re-create the client when the stored id 404s', async () => {
            // Previously unreachable: needs a REAL 404 client error.
            const authup = createFakeAuthupClient({
                handlers: {
                    'GET /clients/:id': () => fakeAuthupResponse(404, { message: 'not found' }),
                    'POST /clients': () => ({ data: { id: 'client-new' }, meta: {} }),
                },
            });
            const service = new AnalysisClientService(authup);

            const entity = createAnalysisEntity({ clientId: 'client-gone' });
            const client = await service.assign(entity);

            expect(client.id).toBe('client-new');
            expect(entity.clientId).toBe('client-new');
        });

        it('should propagate a non-404 failure when reading the stored client', async () => {
            const authup = createFakeAuthupClient({ handlers: { 'GET /clients/:id': () => fakeAuthupResponse(500, { message: 'boom' }) } });
            const service = new AnalysisClientService(authup);

            await expect(service.assign(createAnalysisEntity({ clientId: 'client-x' })))
                .rejects.toThrow();
            expect(bodiesOf(authup, 'POST', '/clients')).toHaveLength(0);
        });
    });

    describe('dismiss', () => {
        it('should delete the client and clear the id', async () => {
            const authup = createFakeAuthupClient({ handlers: { 'DELETE /clients/:id': (req) => ({ data: { id: req.params.id }, meta: {} }) } });
            const service = new AnalysisClientService(authup);

            const entity = createAnalysisEntity({ clientId: 'client-x' });
            await service.dismiss(entity);

            expect(authup.requests.map((request) => request.method)).toEqual(['DELETE']);
            expect(authup.requests[0].params.id).toBe('client-x');
            expect(entity.clientId).toBeNull();
        });

        it('should be a no-op when there is no clientId', async () => {
            const authup = createFakeAuthupClient();
            const service = new AnalysisClientService(authup);

            await service.dismiss(createAnalysisEntity({ clientId: null }));

            expect(authup.requests).toHaveLength(0);
        });

        it('should treat an already-deleted client as success', async () => {
            // Previously unreachable: needs a REAL 404 client error.
            const authup = createFakeAuthupClient({ handlers: { 'DELETE /clients/:id': () => fakeAuthupResponse(404, { message: 'not found' }) } });
            const service = new AnalysisClientService(authup);

            const entity = createAnalysisEntity({ clientId: 'client-gone' });
            await service.dismiss(entity);

            expect(entity.clientId).toBeNull();
        });

        it('should propagate a non-404 delete failure and keep the id', async () => {
            const authup = createFakeAuthupClient({ handlers: { 'DELETE /clients/:id': () => fakeAuthupResponse(500, { message: 'boom' }) } });
            const service = new AnalysisClientService(authup);

            const entity = createAnalysisEntity({ clientId: 'client-x' });
            await expect(service.dismiss(entity)).rejects.toThrow();
            expect(entity.clientId).toBe('client-x');
        });
    });

    describe('assignDefaultPermissions', () => {
        it('should grant both self-capabilities to a client with none', async () => {
            const authup = createFakeAuthupClient({
                handlers: {
                    'GET /client-permissions': () => ({ data: [], meta: { total: 0 } }),
                    'GET /permissions/:name': (req) => ({
                        data: { id: `perm-${req.params.name}`, name: req.params.name },
                        meta: {},
                    }),
                    'POST /client-permissions': (req) => ({ data: { id: 'cp-1', ...(req.body as object) }, meta: {} }),
                },
            });
            const service = new AnalysisClientService(authup);

            await service.assignDefaultPermissions({ id: 'client-1' } as Client);

            const created = bodiesOf(authup, 'POST', '/client-permissions').map((body) => body.permissionId);
            expect(created).toContain(`perm-${PermissionName.ANALYSIS_SELF_STORAGE_USE}`);
            expect(created).toContain(`perm-${PermissionName.ANALYSIS_SELF_MESSAGE_BROKER_USE}`);
            expect(created).toHaveLength(2);
        });

        it('should additively add only the missing permission and never delete', async () => {
            const authup = createFakeAuthupClient({
                handlers: {
                    'GET /client-permissions': () => ({
                        data: [
                            { id: 'cp-existing', permission: { name: PermissionName.ANALYSIS_SELF_STORAGE_USE } },
                        ],
                        meta: { total: 1 },
                    }),
                    'GET /permissions/:name': (req) => ({
                        data: { id: `perm-${req.params.name}`, name: req.params.name },
                        meta: {},
                    }),
                    'POST /client-permissions': (req) => ({ data: { id: 'cp-1', ...(req.body as object) }, meta: {} }),
                },
            });
            const service = new AnalysisClientService(authup);

            await service.assignDefaultPermissions({ id: 'client-1' } as Client);

            const created = bodiesOf(authup, 'POST', '/client-permissions');
            expect(created).toHaveLength(1);
            expect(created[0].permissionId).toBe(`perm-${PermissionName.ANALYSIS_SELF_MESSAGE_BROKER_USE}`);
            expect(authup.requests.some((request) => request.method === 'DELETE')).toBe(false);
        });

        it('should skip a permission that does not exist rather than failing', async () => {
            // Previously unreachable: the warn-and-continue branch is guarded by
            // `isClientErrorWithStatusCode(e, 404)`.
            const authup = createFakeAuthupClient({
                handlers: {
                    'GET /client-permissions': () => ({ data: [], meta: { total: 0 } }),
                    [`GET /permissions/${PermissionName.ANALYSIS_SELF_STORAGE_USE}`]: () => fakeAuthupResponse(404, { message: 'not found' }),
                    'GET /permissions/:name': (req) => ({
                        data: { id: `perm-${req.params.name}`, name: req.params.name },
                        meta: {},
                    }),
                    'POST /client-permissions': (req) => ({ data: { id: 'cp-1', ...(req.body as object) }, meta: {} }),
                },
            });
            const service = new AnalysisClientService(authup);

            await service.assignDefaultPermissions({ id: 'client-1' } as Client);

            const created = bodiesOf(authup, 'POST', '/client-permissions');
            expect(created).toHaveLength(1);
            expect(created[0].permissionId).toBe(`perm-${PermissionName.ANALYSIS_SELF_MESSAGE_BROKER_USE}`);
        });

        it('should filter the existing permissions by the client id', async () => {
            const authup = createFakeAuthupClient({
                handlers: {
                    'GET /client-permissions': () => ({ data: [], meta: { total: 0 } }),
                    'GET /permissions/:name': (req) => ({
                        data: { id: `perm-${req.params.name}`, name: req.params.name },
                        meta: {},
                    }),
                    'POST /client-permissions': (req) => ({ data: { id: 'cp-1', ...(req.body as object) }, meta: {} }),
                },
            });
            const service = new AnalysisClientService(authup);

            await service.assignDefaultPermissions({ id: 'client-42' } as Client);

            const query = decodeURIComponent(authup.requests[0].url);
            expect(query).toContain('client-42');
            expect(query).toContain('permission');
        });
    });
});
