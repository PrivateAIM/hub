/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { AnalysisMetadataCommand } from '../../../../../../src/core/domains/index.ts';
import { AnalysisBucketFileSubscriber } from '../../../../../../src/adapters/database/subscribers/analysis/bucket-file.ts';
import { FakeMetadataCaller } from './helpers/fake-metadata-caller.ts';

function createMockInsertEvent(overrides: Record<string, any> = {}) {
    return {
        entity: {
            id: randomUUID(),
            analysis_id: randomUUID(),
            realm_id: randomUUID(),
            root: true,
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
            realm_id: randomUUID(),
        },
        databaseEntity: { analysis_id: analysisId },
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
            realm_id: randomUUID(),
            root: true,
        },
        manager: {},
        queryRunner: { data: {} },
        ...overrides,
    };
}

describe('AnalysisBucketFileSubscriber', () => {
    describe('afterInsert', () => {
        it('should call metadataCaller for root files when set via setter', async () => {
            const metadataCaller = new FakeMetadataCaller();
            const subscriber = new AnalysisBucketFileSubscriber();
            subscriber.setMetadataCaller(metadataCaller);

            const event = createMockInsertEvent();
            await subscriber.afterInsert(event as any);

            expect(metadataCaller.getCallCount()).toBe(1);

            const call = metadataCaller.getLastCall();
            expect(call!.command).toBe(AnalysisMetadataCommand.RECALC);
            expect(call!.data).toEqual({
                analysisId: event.entity.analysis_id,
                queryNodes: false,
                querySelf: false,
            });
            expect(call!.meta).toEqual({ entityManager: event.manager });
        });

        it('should not call metadataCaller for non-root files', async () => {
            const metadataCaller = new FakeMetadataCaller();
            const subscriber = new AnalysisBucketFileSubscriber();
            subscriber.setMetadataCaller(metadataCaller);

            const event = createMockInsertEvent({
                entity: {
                    id: randomUUID(), 
                    analysis_id: randomUUID(), 
                    root: false, 
                }, 
            });
            await subscriber.afterInsert(event as any);

            expect(metadataCaller.getCallCount()).toBe(0);
        });

        it('should not call metadataCaller when not set', async () => {
            const subscriber = new AnalysisBucketFileSubscriber();

            const event = createMockInsertEvent();
            await subscriber.afterInsert(event as any);
            // No error thrown
        });
    });

    describe('afterUpdate', () => {
        it('should call metadataCaller when set via setter', async () => {
            const metadataCaller = new FakeMetadataCaller();
            const subscriber = new AnalysisBucketFileSubscriber();
            subscriber.setMetadataCaller(metadataCaller);

            const event = createMockUpdateEvent();
            await subscriber.afterUpdate(event as any);

            expect(metadataCaller.getCallCount()).toBe(1);

            const call = metadataCaller.getLastCall();
            expect(call!.command).toBe(AnalysisMetadataCommand.RECALC);
            expect(call!.data).toEqual({
                analysisId: event.entity.analysis_id,
                queryNodes: false,
                querySelf: false,
            });
        });

        it('should not call metadataCaller when not set', async () => {
            const subscriber = new AnalysisBucketFileSubscriber();

            const event = createMockUpdateEvent();
            await subscriber.afterUpdate(event as any);
            // No error thrown
        });
    });

    describe('afterRemove', () => {
        it('should call metadataCaller for root files when set via setter', async () => {
            const metadataCaller = new FakeMetadataCaller();
            const subscriber = new AnalysisBucketFileSubscriber();
            subscriber.setMetadataCaller(metadataCaller);

            const event = createMockRemoveEvent();
            await subscriber.afterRemove(event as any);

            expect(metadataCaller.getCallCount()).toBe(1);
        });

        it('should not call metadataCaller for non-root files', async () => {
            const metadataCaller = new FakeMetadataCaller();
            const subscriber = new AnalysisBucketFileSubscriber();
            subscriber.setMetadataCaller(metadataCaller);

            const event = createMockRemoveEvent({
                entity: {
                    id: randomUUID(), 
                    analysis_id: randomUUID(), 
                    root: false, 
                }, 
            });
            await subscriber.afterRemove(event as any);

            expect(metadataCaller.getCallCount()).toBe(0);
        });
    });
});
