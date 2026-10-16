/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Analysis, AnalysisNodeEvent, Node } from '@privateaim/core-kit';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { AnalysisNodeEventService } from '../../../../../src/core/entities/analysis-node-event/service.ts';
import { AnalysisReachService } from '../../../../../src/core/services/analysis-reach/index.ts';
import {
    FakeEntityRepository,
    createAllowAllActor,
    createDenyAllActor,
} from '@privateaim/server-test-kit';
import { FakeAnalysisNodeRepository } from '../analysis-node/fake-repository.ts';

function createTestAnalysisNodeEvent(overrides?: Partial<AnalysisNodeEvent>): AnalysisNodeEvent {
    const analysisId = overrides?.analysisId ?? randomUUID();
    const analysisRealmId = overrides?.analysisRealmId ?? 'realm-1';

    return {
        id: randomUUID(),
        eventId: randomUUID(),
        analysisId,
        // the in-memory adapter resolves `analysis.realmId` through this object
        analysis: { id: analysisId, realmId: analysisRealmId } as Analysis,
        analysisRealmId,
        nodeId: randomUUID(),
        nodeRealmId: 'realm-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    } as AnalysisNodeEvent;
}

describe('AnalysisNodeEventService', () => {
    let repository: FakeEntityRepository<AnalysisNodeEvent>;
    let service: AnalysisNodeEventService;

    const allowAll = () => {
        const actor = createAllowAllActor();
        actor.permissionEvaluator.setCompileResult({ verdict: 'allow' });
        return actor;
    };

    beforeEach(() => {
        repository = new FakeEntityRepository<AnalysisNodeEvent>();
        service = new AnalysisNodeEventService({
            repository,
            reach: new AnalysisReachService({
                analysisNodeRepository: new FakeAnalysisNodeRepository(),
                analysisRepository: new FakeEntityRepository<Analysis>(),
                nodeRepository: new FakeEntityRepository<Node>(),
            }),
        });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            repository.seed([
                createTestAnalysisNodeEvent({ id: 'ane-1' }),
                createTestAnalysisNodeEvent({ id: 'ane-2' }),
                createTestAnalysisNodeEvent({ id: 'ane-3' }),
            ]);

            const result = await service.getMany({}, allowAll());
            expect(result.data).toHaveLength(3);
            expect(result.meta.total).toBe(3);
        });

        it('should return empty when no entities exist', async () => {
            const result = await service.getMany({}, allowAll());
            expect(result.data).toHaveLength(0);
            expect(result.meta.total).toBe(0);
        });

        it('should narrow to the analyses the actor reaches', async () => {
            repository.seed([
                createTestAnalysisNodeEvent({ id: 'own', analysisRealmId: 'realm-a' }),
                createTestAnalysisNodeEvent({ id: 'foreign', analysisRealmId: 'realm-c' }),
            ]);

            const result = await service.getMany({}, createAllowAllActor('realm-a'));
            expect(result.data.map((e) => e.id)).toEqual(['own']);
        });

        it('should refuse an actor without any analysis read permission', async () => {
            await expect(service.getMany({}, createDenyAllActor())).rejects.toThrow(PermissionDeniedError);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            const event = createTestAnalysisNodeEvent({ id: 'ane-1' });
            repository.seed(event);

            const result = await service.getOne('ane-1', allowAll());
            expect(result.id).toBe('ane-1');
            expect(result.analysisId).toBe(event.analysisId);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(service.getOne('nonexistent', allowAll())).rejects.toThrow(EntityNotFoundError);
        });

        it('should answer an event out of reach like a missing one', async () => {
            repository.seed(createTestAnalysisNodeEvent({ id: 'foreign', analysisRealmId: 'realm-c' }));

            await expect(service.getOne('foreign', createAllowAllActor('realm-a'))).rejects.toThrow(EntityNotFoundError);
        });
    });
});
