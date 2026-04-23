/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Event } from '@privateaim/telemetry-kit';
import { ForbiddenError, NotFoundError } from '@ebec/http';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { EventService } from '../../../../../src/core/entities/event/service.ts';
import type { FakePermissionChecker } from '@privateaim/server-test-kit';
import {
    FakeEntityRepository,
    createAllowAllActor,
    createDenyAllActor,
    createMasterRealmActor,
    createNonMasterRealmActor,
} from '@privateaim/server-test-kit';

function createTestEvent(overrides?: Partial<Event>): Event {
    return {
        id: randomUUID(),
        ref_type: 'project',
        ref_id: randomUUID(),
        scope: 'model',
        name: 'updated',
        data: null,
        expiring: false,
        request_path: null,
        request_method: null,
        request_ip_address: null,
        request_user_agent: null,
        actor_type: null,
        actor_id: null,
        actor_name: null,
        realm_id: 'realm-1',
        expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...overrides,
    } as Event;
}

describe('EventService', () => {
    let repository: FakeEntityRepository<Event>;
    let service: EventService;

    beforeEach(() => {
        repository = new FakeEntityRepository<Event>();
        service = new EventService({ repository });
    });

    describe('getMany', () => {
        it('should return paginated results', async () => {
            repository.seed([
                createTestEvent({ id: 'e-1' }),
                createTestEvent({ id: 'e-2' }),
            ]);

            const result = await service.getMany({}, createAllowAllActor());
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
        });

        it('should check permission', async () => {
            const actor = createAllowAllActor();
            await service.getMany({}, actor);

            expect((actor.permissionChecker as FakePermissionChecker).wasMethodCalled('preCheckOneOf')).toBe(true);
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            await expect(
                service.getMany({}, createDenyAllActor()),
            ).rejects.toThrow(ForbiddenError);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            const event = createTestEvent({ id: 'e-1' });
            repository.seed(event);

            const result = await service.getOne('e-1', createAllowAllActor());
            expect(result.id).toBe('e-1');
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.getOne('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            const event = createTestEvent({ id: 'e-1' });
            repository.seed(event);

            await expect(
                service.getOne('e-1', createDenyAllActor()),
            ).rejects.toThrow(ForbiddenError);
        });
    });

    describe('create', () => {
        it('should create with valid data', async () => {
            const result = await service.create(
                {
                    ref_type: 'analysis',
                    scope: 'model',
                    name: 'created',
                },
                createAllowAllActor(),
            );

            expect(result.ref_type).toBe('analysis');
            expect(result.scope).toBe('model');
            expect(result.name).toBe('created');
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            await expect(
                service.create(
                    {
                        ref_type: 'analysis',
                        scope: 'model',
                        name: 'created',
                    },
                    createDenyAllActor(),
                ),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should set realm_id from actor when not provided', async () => {
            const actor = createMasterRealmActor('my-realm');

            const result = await service.create(
                {
                    ref_type: 'analysis',
                    scope: 'model',
                    name: 'created',
                },
                actor,
            );

            expect(result.realm_id).toBe('my-realm');
        });

        it('should throw ForbiddenError when non-master realm sets different realm_id', async () => {
            const actor = createNonMasterRealmActor('realm-1');
            const otherRealmId = randomUUID();

            await expect(
                service.create(
                    {
                        ref_type: 'analysis',
                        scope: 'model',
                        name: 'created',
                        realm_id: otherRealmId,
                    },
                    actor,
                ),
            ).rejects.toThrow(ForbiddenError);
        });
    });

    describe('delete', () => {
        it('should delete existing entity', async () => {
            const event = createTestEvent();
            repository.seed(event);

            const result = await service.delete(event.id, createMasterRealmActor());
            expect(result.id).toBe(event.id);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should throw ForbiddenError when actor lacks permission', async () => {
            const event = createTestEvent();
            repository.seed(event);

            await expect(
                service.delete(event.id, createDenyAllActor()),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should throw NotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(NotFoundError);
        });

        it('should enforce realm writability for non-master realm', async () => {
            const event = createTestEvent({ realm_id: 'other-realm' });
            repository.seed(event);

            await expect(
                service.delete(event.id, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(ForbiddenError);
        });

        it('should allow master realm to delete any event', async () => {
            const event = createTestEvent({ realm_id: 'other-realm' });
            repository.seed(event);

            const result = await service.delete(event.id, createMasterRealmActor());
            expect(result.id).toBe(event.id);
        });

        it('should allow delete when event has no realm_id', async () => {
            const event = createTestEvent({ realm_id: null });
            repository.seed(event);

            const result = await service.delete(event.id, createNonMasterRealmActor('realm-1'));
            expect(result.id).toBe(event.id);
        });
    });
});
