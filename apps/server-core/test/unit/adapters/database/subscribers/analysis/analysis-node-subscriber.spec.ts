/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { AnalysisMetadataCommand } from '../../../../../../src/core/domains/index.ts';
import { AnalysisNodeSubscriber } from '../../../../../../src/adapters/database/subscribers/analysis/node.ts';
import { FakeMetadataCaller } from './helpers/fake-metadata-caller.ts';

function createMockInsertEvent(overrides: Record<string, any> = {}) {
    return {
        entity: {
            id: randomUUID(),
            analysis_id: randomUUID(),
            analysis_realm_id: randomUUID(),
        },
        manager: {},
        queryRunner: { data: {} },
        ...overrides,
    };
}

function createMockUpdateEvent(overrides: Record<string, any> = {}) {
    const analysisId = randomUUID();
    return {
        entity: {
            id: randomUUID(),
            analysis_id: analysisId,
            analysis_realm_id: randomUUID(),
        },
        databaseEntity: {
            id: randomUUID(),
            analysis_id: analysisId,
        },
        manager: {},
        queryRunner: { data: {} },
        ...overrides,
    };
}

function createMockRemoveEvent(overrides: Record<string, any> = {}) {
    return {
        entity: {
            id: randomUUID(),
            analysis_id: randomUUID(),
            analysis_realm_id: randomUUID(),
        },
        databaseEntity: null,
        manager: {},
        queryRunner: { data: {} },
        ...overrides,
    };
}

describe('AnalysisNodeSubscriber', () => {
    describe('afterInsert', () => {
        it('should call metadataCaller when set via setter', async () => {
            const metadataCaller = new FakeMetadataCaller();
            const subscriber = new AnalysisNodeSubscriber();
            subscriber.setMetadataCaller(metadataCaller);

            const event = createMockInsertEvent();
            await subscriber.afterInsert(event as any);

            expect(metadataCaller.getCallCount()).toBe(1);

            const call = metadataCaller.getLastCall();
            expect(call!.command).toBe(AnalysisMetadataCommand.RECALC);
            expect(call!.data).toEqual({
                analysisId: event.entity.analysis_id,
                queryFiles: false,
                querySelf: false,
            });
            expect(call!.meta).toEqual({ entityManager: event.manager });
        });

        it('should not call metadataCaller when not set', async () => {
            const subscriber = new AnalysisNodeSubscriber();

            const event = createMockInsertEvent();
            await subscriber.afterInsert(event as any);
            // No error thrown
        });
    });

    describe('afterUpdate', () => {
        it('should call metadataCaller when set via setter', async () => {
            const metadataCaller = new FakeMetadataCaller();
            const subscriber = new AnalysisNodeSubscriber();
            subscriber.setMetadataCaller(metadataCaller);

            const event = createMockUpdateEvent();
            await subscriber.afterUpdate(event as any);

            expect(metadataCaller.getCallCount()).toBe(1);

            const call = metadataCaller.getLastCall();
            expect(call!.command).toBe(AnalysisMetadataCommand.RECALC);
            expect(call!.data).toEqual({
                analysisId: event.entity.analysis_id,
                queryFiles: false,
                querySelf: false,
            });
            expect(call!.meta).toEqual({ entityManager: event.manager });
        });

        it('should not call metadataCaller when not set', async () => {
            const subscriber = new AnalysisNodeSubscriber();

            const event = createMockUpdateEvent();
            await subscriber.afterUpdate(event as any);
            // No error thrown
        });

        it('should not call when no analysisId available', async () => {
            const metadataCaller = new FakeMetadataCaller();
            const subscriber = new AnalysisNodeSubscriber();
            subscriber.setMetadataCaller(metadataCaller);

            const event = createMockUpdateEvent({
                entity: {},
                databaseEntity: {},
            });
            await subscriber.afterUpdate(event as any);

            expect(metadataCaller.getCallCount()).toBe(0);
        });

        it('should use databaseEntity analysisId when entity analysisId is missing', async () => {
            const metadataCaller = new FakeMetadataCaller();
            const subscriber = new AnalysisNodeSubscriber();
            subscriber.setMetadataCaller(metadataCaller);

            const dbAnalysisId = randomUUID();
            const event = createMockUpdateEvent({
                entity: {},
                databaseEntity: { analysis_id: dbAnalysisId },
            });
            await subscriber.afterUpdate(event as any);

            expect(metadataCaller.getCallCount()).toBe(1);
            expect(metadataCaller.getLastCall()!.data.analysisId).toBe(dbAnalysisId);
        });
    });

    describe('afterRemove', () => {
        it('should call metadataCaller when set via setter', async () => {
            const metadataCaller = new FakeMetadataCaller();
            const subscriber = new AnalysisNodeSubscriber();
            subscriber.setMetadataCaller(metadataCaller);

            const event = createMockRemoveEvent();
            await subscriber.afterRemove(event as any);

            expect(metadataCaller.getCallCount()).toBe(1);

            const call = metadataCaller.getLastCall();
            expect(call!.command).toBe(AnalysisMetadataCommand.RECALC);
            expect(call!.data).toEqual({
                analysisId: event.entity.analysis_id,
                queryFiles: false,
                querySelf: false,
            });
            expect(call!.meta).toEqual({ entityManager: event.manager });
        });

        it('should not call when no analysisId available', async () => {
            const metadataCaller = new FakeMetadataCaller();
            const subscriber = new AnalysisNodeSubscriber();
            subscriber.setMetadataCaller(metadataCaller);

            const event = createMockRemoveEvent({
                entity: null,
                databaseEntity: null,
            });
            await subscriber.afterRemove(event as any);

            expect(metadataCaller.getCallCount()).toBe(0);
        });
    });
});
