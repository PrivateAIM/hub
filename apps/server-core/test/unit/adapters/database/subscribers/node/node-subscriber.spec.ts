/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Client } from '@authup/core-kit';
import { describe, expect, it } from 'vitest';
import { NodeSubscriber } from '../../../../../../src/adapters/database/subscribers/node/module.ts';
import type { NodeClientService } from '../../../../../../src/app/modules/database/node-client.ts';

type DismissCall = { entity: Record<string, any> };
type AssignCall = { entity: Record<string, any> };
type AssignPermissionsCall = { client: Client };

class FakeNodeClientService {
    private dismissCalls: DismissCall[] = [];

    private assignCalls: AssignCall[] = [];

    private assignPermissionsCalls: AssignPermissionsCall[] = [];

    private nextClientId = 'client-1';

    async dismiss(entity: Record<string, any>): Promise<void> {
        this.dismissCalls.push({ entity });
        entity.client_id = null;
    }

    async assign(entity: Record<string, any>): Promise<Client> {
        this.assignCalls.push({ entity });
        entity.client_id = this.nextClientId;
        return { id: this.nextClientId } as Client;
    }

    async assignPermissions(client: Client): Promise<void> {
        this.assignPermissionsCalls.push({ client });
    }

    getDismissCalls(): DismissCall[] {
        return [...this.dismissCalls];
    }

    getAssignCalls(): AssignCall[] {
        return [...this.assignCalls];
    }

    getAssignPermissionsCalls(): AssignPermissionsCall[] {
        return [...this.assignPermissionsCalls];
    }
}

function createMockRemoveEvent(overrides: Record<string, any> = {}) {
    return {
        entity: {
            id: randomUUID(), 
            client_id: 'existing-client', 
            realm_id: randomUUID(), 
        },
        databaseEntity: null,
        queryRunner: { data: {} },
        ...overrides,
    };
}

function createMockInsertEvent(overrides: Record<string, any> = {}) {
    const entityId = randomUUID();
    return {
        entity: {
            id: entityId, 
            client_id: null, 
            realm_id: randomUUID(), 
        },
        queryRunner: { data: {} },
        manager: { getRepository: () => ({ save: async (e: Record<string, any>) => e }) },
        ...overrides,
    };
}

function createMockUpdateEvent(overrides: Record<string, any> = {}) {
    const entityId = randomUUID();
    return {
        entity: {
            id: entityId, 
            client_id: null, 
            realm_id: randomUUID(), 
        },
        databaseEntity: { id: entityId },
        queryRunner: { data: {} },
        manager: { getRepository: () => ({ save: async (e: Record<string, any>) => e }) },
        ...overrides,
    };
}

describe('NodeSubscriber', () => {
    describe('afterRemove', () => {
        it('should call nodeClientService.dismiss when service is set', async () => {
            const nodeClientService = new FakeNodeClientService();
            const subscriber = new NodeSubscriber({ nodeClientService: nodeClientService as unknown as NodeClientService });

            const event = createMockRemoveEvent();
            await subscriber.afterRemove(event as any);

            expect(nodeClientService.getDismissCalls()).toHaveLength(1);
            expect(nodeClientService.getDismissCalls()[0].entity).toBe(event.entity);
        });

        it('should not throw when nodeClientService is not set', async () => {
            const subscriber = new NodeSubscriber();

            const event = createMockRemoveEvent();
            await subscriber.afterRemove(event as any);
            // no error — graceful no-op
        });
    });

    describe('afterInsert', () => {
        it('should call nodeClientService.assign when service is set', async () => {
            const nodeClientService = new FakeNodeClientService();
            const subscriber = new NodeSubscriber({ nodeClientService: nodeClientService as unknown as NodeClientService });

            const event = createMockInsertEvent();
            await subscriber.afterInsert(event as any);

            expect(nodeClientService.getAssignCalls()).toHaveLength(1);
        });

        it('should call nodeClientService.assignPermissions after assign', async () => {
            const nodeClientService = new FakeNodeClientService();
            const subscriber = new NodeSubscriber({ nodeClientService: nodeClientService as unknown as NodeClientService });

            const event = createMockInsertEvent();
            await subscriber.afterInsert(event as any);

            expect(nodeClientService.getAssignPermissionsCalls()).toHaveLength(1);
            expect(nodeClientService.getAssignPermissionsCalls()[0].client.id).toBe('client-1');
        });

        it('should not throw when nodeClientService is not set', async () => {
            const subscriber = new NodeSubscriber();

            const event = createMockInsertEvent();
            await subscriber.afterInsert(event as any);
        });
    });

    describe('afterUpdate', () => {
        it('should call nodeClientService.assign with merged entity', async () => {
            const nodeClientService = new FakeNodeClientService();
            const subscriber = new NodeSubscriber({ nodeClientService: nodeClientService as unknown as NodeClientService });

            const event = createMockUpdateEvent();
            await subscriber.afterUpdate(event as any);

            expect(nodeClientService.getAssignCalls()).toHaveLength(1);
        });

        it('should call nodeClientService.assignPermissions after assign', async () => {
            const nodeClientService = new FakeNodeClientService();
            const subscriber = new NodeSubscriber({ nodeClientService: nodeClientService as unknown as NodeClientService });

            const event = createMockUpdateEvent();
            await subscriber.afterUpdate(event as any);

            expect(nodeClientService.getAssignPermissionsCalls()).toHaveLength(1);
            expect(nodeClientService.getAssignPermissionsCalls()[0].client.id).toBe('client-1');
        });

        it('should save entity when client_id changes', async () => {
            const nodeClientService = new FakeNodeClientService();
            const subscriber = new NodeSubscriber({ nodeClientService: nodeClientService as unknown as NodeClientService });

            let savedEntity: Record<string, any> | undefined;
            const event = createMockUpdateEvent({
                entity: {
                    id: randomUUID(), 
                    client_id: null, 
                    realm_id: randomUUID(), 
                },
                manager: { getRepository: () => ({ save: async (e: Record<string, any>) => { savedEntity = e; return e; } }) },
            });
            await subscriber.afterUpdate(event as any);

            expect(savedEntity).toBeDefined();
            expect(savedEntity!.client_id).toBe('client-1');
        });

        it('should not save entity when client_id is unchanged', async () => {
            const nodeClientService = new FakeNodeClientService();
            const subscriber = new NodeSubscriber({ nodeClientService: nodeClientService as unknown as NodeClientService });

            let saveCalled = false;
            const event = createMockUpdateEvent({
                entity: {
                    id: randomUUID(), 
                    client_id: 'client-1', 
                    realm_id: randomUUID(), 
                },
                manager: { getRepository: () => ({ save: async (e: Record<string, any>) => { saveCalled = true; return e; } }) },
            });
            await subscriber.afterUpdate(event as any);

            expect(saveCalled).toBe(false);
            expect(nodeClientService.getAssignPermissionsCalls()).toHaveLength(1);
        });

        it('should not throw when nodeClientService is not set', async () => {
            const subscriber = new NodeSubscriber();

            const event = createMockUpdateEvent();
            await subscriber.afterUpdate(event as any);
        });
    });
});
