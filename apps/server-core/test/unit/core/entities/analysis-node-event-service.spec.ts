/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { AnalysisNodeEvent } from '@privateaim/core-kit';
import { NotFoundError } from '@ebec/http';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisNodeEventService } from '../../../../src/core/entities/analysis-node-event/service.ts';
import { FakeEntityRepository } from '../helpers/index.ts';

function createTestAnalysisNodeEvent(overrides?: Partial<AnalysisNodeEvent>): AnalysisNodeEvent {
    return {
        id: randomUUID(),
        event_id: randomUUID(),
        analysis_id: randomUUID(),
        analysis_realm_id: 'realm-1',
        node_id: randomUUID(),
        node_realm_id: 'realm-1',
        created_at: new Date(),
        updated_at: new Date(),
        ...overrides,
    } as AnalysisNodeEvent;
}

describe('AnalysisNodeEventService', () => {
    let repository: FakeEntityRepository<AnalysisNodeEvent>;
    let service: AnalysisNodeEventService;

    beforeEach(() => {
        repository = new FakeEntityRepository<AnalysisNodeEvent>();
        service = new AnalysisNodeEventService({ repository });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            repository.seed([
                createTestAnalysisNodeEvent({ id: 'ane-1' }),
                createTestAnalysisNodeEvent({ id: 'ane-2' }),
                createTestAnalysisNodeEvent({ id: 'ane-3' }),
            ]);

            const result = await service.getMany({});
            expect(result.data).toHaveLength(3);
            expect(result.meta.total).toBe(3);
        });

        it('should return empty when no entities exist', async () => {
            const result = await service.getMany({});
            expect(result.data).toHaveLength(0);
            expect(result.meta.total).toBe(0);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            const event = createTestAnalysisNodeEvent({ id: 'ane-1' });
            repository.seed(event);

            const result = await service.getOne('ane-1');
            expect(result.id).toBe('ane-1');
            expect(result.analysis_id).toBe(event.analysis_id);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent')).rejects.toThrow(NotFoundError);
        });
    });
});
