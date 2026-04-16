/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { AnalysisMetadataCommand } from '../../../../../../src/core/domains/index.ts';
import { AnalysisSubscriber } from '../../../../../../src/adapters/database/subscribers/analysis/module.ts';
import { FakeMetadataCaller } from './helpers/fake-metadata-caller.ts';
import { FakeStorageManager } from './helpers/fake-storage-manager.ts';

function createMockUpdateEvent(overrides: Record<string, any> = {}) {
    const analysisId = randomUUID();
    return {
        entity: { id: analysisId, realm_id: randomUUID() },
        databaseEntity: { id: analysisId },
        manager: {},
        queryRunner: { data: {} },
        ...overrides,
    };
}

function createMockInsertEvent(overrides: Record<string, any> = {}) {
    return {
        entity: { id: randomUUID(), realm_id: randomUUID() },
        queryRunner: { data: {} },
        ...overrides,
    };
}

function createMockRemoveEvent(overrides: Record<string, any> = {}) {
    return {
        entity: { id: randomUUID(), realm_id: randomUUID() },
        queryRunner: { data: {} },
        ...overrides,
    };
}

describe('AnalysisSubscriber', () => {
    describe('afterUpdate', () => {
        it('should call metadataCaller when set via setter', async () => {
            const metadataCaller = new FakeMetadataCaller();
            const subscriber = new AnalysisSubscriber();
            subscriber.setMetadataCaller(metadataCaller);

            const event = createMockUpdateEvent();
            await subscriber.afterUpdate(event as any);

            expect(metadataCaller.getCallCount()).toBe(1);

            const call = metadataCaller.getLastCall();
            expect(call).toBeDefined();
            expect(call!.command).toBe(AnalysisMetadataCommand.RECALC);
            expect(call!.data).toEqual({
                analysisId: event.entity.id,
                queryNodes: false,
                queryFiles: false,
            });
            expect(call!.meta).toEqual({ entityManager: event.manager });
        });

        it('should call metadataCaller when set via constructor', async () => {
            const metadataCaller = new FakeMetadataCaller();
            const subscriber = new AnalysisSubscriber({ metadataCaller });

            const event = createMockUpdateEvent();
            await subscriber.afterUpdate(event as any);

            expect(metadataCaller.getCallCount()).toBe(1);
        });

        it('should not call metadataCaller when not set', async () => {
            const subscriber = new AnalysisSubscriber();

            const event = createMockUpdateEvent();
            await subscriber.afterUpdate(event as any);
            // No error thrown — silently skips
        });

        it('should not call metadataCaller when entity has no id', async () => {
            const metadataCaller = new FakeMetadataCaller();
            const subscriber = new AnalysisSubscriber();
            subscriber.setMetadataCaller(metadataCaller);

            const event = createMockUpdateEvent({
                entity: {},
                databaseEntity: {},
            });
            await subscriber.afterUpdate(event as any);

            expect(metadataCaller.getCallCount()).toBe(0);
        });

        it('should use databaseEntity id when entity id is missing', async () => {
            const metadataCaller = new FakeMetadataCaller();
            const subscriber = new AnalysisSubscriber();
            subscriber.setMetadataCaller(metadataCaller);

            const dbId = randomUUID();
            const event = createMockUpdateEvent({
                entity: {},
                databaseEntity: { id: dbId },
            });
            await subscriber.afterUpdate(event as any);

            expect(metadataCaller.getCallCount()).toBe(1);
            expect(metadataCaller.getLastCall()!.data.analysisId).toBe(dbId);
        });
    });

    describe('afterInsert', () => {
        it('should call storageManager.check when set via setter', async () => {
            const storageManager = new FakeStorageManager();
            const subscriber = new AnalysisSubscriber();
            subscriber.setStorageManager(storageManager);

            const event = createMockInsertEvent();
            await subscriber.afterInsert(event as any);

            expect(storageManager.getCallsFor('check').length).toBe(1);
            expect(storageManager.getCallsFor('check')[0].input).toBe(event.entity);
        });

        it('should not call storageManager when not set', async () => {
            const subscriber = new AnalysisSubscriber();

            const event = createMockInsertEvent();
            await subscriber.afterInsert(event as any);
            // No error thrown
        });
    });

    describe('beforeRemove', () => {
        it('should call storageManager.remove when set via setter', async () => {
            const storageManager = new FakeStorageManager();
            const subscriber = new AnalysisSubscriber();
            subscriber.setStorageManager(storageManager);

            const event = createMockRemoveEvent();
            await subscriber.beforeRemove(event as any);

            expect(storageManager.getCallsFor('remove').length).toBe(1);
            expect(storageManager.getCallsFor('remove')[0].input).toBe(event.entity);
        });
    });
});
