/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Client } from '@authup/core-kit';
import { describe, expect, it } from 'vitest';
import { AnalysisSubscriber } from '../../../../../../src/adapters/database/subscribers/analysis/module.ts';
import type { AnalysisClientService } from '../../../../../../src/app/modules/database/analysis-client.ts';

type DismissCall = { entity: Record<string, any> };
type AssignCall = { entity: Record<string, any> };
type AssignDefaultPermissionsCall = { client: Client };

class FakeAnalysisClientService {
    private dismissCalls: DismissCall[] = [];

    private assignCalls: AssignCall[] = [];

    private assignDefaultPermissionsCalls: AssignDefaultPermissionsCall[] = [];

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

    async assignDefaultPermissions(client: Client): Promise<void> {
        this.assignDefaultPermissionsCalls.push({ client });
    }

    getDismissCalls(): DismissCall[] {
        return [...this.dismissCalls];
    }

    getAssignCalls(): AssignCall[] {
        return [...this.assignCalls];
    }

    getAssignDefaultPermissionsCalls(): AssignDefaultPermissionsCall[] {
        return [...this.assignDefaultPermissionsCalls];
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

describe('AnalysisSubscriber', () => {
    describe('afterRemove', () => {
        it('should call analysisClientService.dismiss when service is set', async () => {
            const analysisClientService = new FakeAnalysisClientService();
            const subscriber = new AnalysisSubscriber({ analysisClientService: analysisClientService as unknown as AnalysisClientService });

            const event = createMockRemoveEvent();
            await subscriber.afterRemove(event as any);

            expect(analysisClientService.getDismissCalls()).toHaveLength(1);
            expect(analysisClientService.getDismissCalls()[0].entity).toBe(event.entity);
        });

        it('should not throw when analysisClientService is not set', async () => {
            const subscriber = new AnalysisSubscriber();

            const event = createMockRemoveEvent();
            await subscriber.afterRemove(event as any);
            // no error — graceful no-op
        });
    });

    describe('afterInsert', () => {
        it('should call analysisClientService.assign when service is set', async () => {
            const analysisClientService = new FakeAnalysisClientService();
            const subscriber = new AnalysisSubscriber({ analysisClientService: analysisClientService as unknown as AnalysisClientService });

            const event = createMockInsertEvent();
            await subscriber.afterInsert(event as any);

            expect(analysisClientService.getAssignCalls()).toHaveLength(1);
        });

        it('should assign the default permissions after assign', async () => {
            const analysisClientService = new FakeAnalysisClientService();
            const subscriber = new AnalysisSubscriber({ analysisClientService: analysisClientService as unknown as AnalysisClientService });

            const event = createMockInsertEvent();
            await subscriber.afterInsert(event as any);

            expect(analysisClientService.getAssignDefaultPermissionsCalls()).toHaveLength(1);
            expect(analysisClientService.getAssignDefaultPermissionsCalls()[0].client.id).toBe('client-1');
        });

        it('should not throw when analysisClientService is not set', async () => {
            const subscriber = new AnalysisSubscriber();

            const event = createMockInsertEvent();
            await subscriber.afterInsert(event as any);
        });
    });

    describe('afterUpdate', () => {
        it('should call analysisClientService.assign with merged entity', async () => {
            const analysisClientService = new FakeAnalysisClientService();
            const subscriber = new AnalysisSubscriber({ analysisClientService: analysisClientService as unknown as AnalysisClientService });

            const event = createMockUpdateEvent();
            await subscriber.afterUpdate(event as any);

            expect(analysisClientService.getAssignCalls()).toHaveLength(1);
        });

        it('should NOT re-assign the default permissions on update', async () => {
            const analysisClientService = new FakeAnalysisClientService();
            const subscriber = new AnalysisSubscriber({ analysisClientService: analysisClientService as unknown as AnalysisClientService });

            const event = createMockUpdateEvent();
            await subscriber.afterUpdate(event as any);

            // The key divergence from the node client: updating an analysis must
            // never re-sync permissions, so admin-configured capabilities survive.
            expect(analysisClientService.getAssignDefaultPermissionsCalls()).toHaveLength(0);
        });

        it('should save entity when client_id changes', async () => {
            const analysisClientService = new FakeAnalysisClientService();
            const subscriber = new AnalysisSubscriber({ analysisClientService: analysisClientService as unknown as AnalysisClientService });

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
            const analysisClientService = new FakeAnalysisClientService();
            const subscriber = new AnalysisSubscriber({ analysisClientService: analysisClientService as unknown as AnalysisClientService });

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
        });

        it('should not throw when analysisClientService is not set', async () => {
            const subscriber = new AnalysisSubscriber();

            const event = createMockUpdateEvent();
            await subscriber.afterUpdate(event as any);
        });
    });
});
