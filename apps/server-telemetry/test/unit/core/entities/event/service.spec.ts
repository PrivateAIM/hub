/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Event } from '@privateaim/telemetry-kit';
import { EntityNotFoundError, PermissionDeniedError } from '@privateaim/errors';
import { PermissionName } from '@privateaim/kit';
import { eq } from '@rapiq/core';
import {
    beforeEach,
    describe,
    expect,
    it,
} from 'vitest';
import { EventService } from '../../../../../src/core/entities/event/service.ts';
import { FakeEventRepository } from './fake-repository.ts';
import {
    createAllowAllActor,
    createDenyAllActor,
    createMasterRealmActor,
    createNonMasterRealmActor,
} from '@privateaim/server-test-kit';

function createTestEvent(overrides?: Partial<Event>): Event {
    return {
        id: randomUUID(),
        refType: 'project',
        refId: randomUUID(),
        scope: 'entity',
        name: 'updated',
        data: null,
        expiring: false,
        requestPath: null,
        requestMethod: null,
        requestIpAddress: null,
        requestUserAgent: null,
        actorType: null,
        actorId: null,
        actorName: null,
        realmId: 'realm-1',
        expiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides,
    } as Event;
}

describe('EventService', () => {
    let repository: FakeEventRepository;
    let service: EventService;

    beforeEach(() => {
        repository = new FakeEventRepository();
        service = new EventService({ repository });
    });

    describe('getMany', () => {
        const seedRealms = () => repository.seed([
            createTestEvent({ id: 'e-1', realmId: 'realm-1' }),
            createTestEvent({ id: 'e-2', realmId: 'realm-2' }),
            createTestEvent({ id: 'e-3', realmId: null }),
        ]);

        const ids = (result: { data: Event[] }) => result.data.map((e) => e.id).sort();

        it('should return every realm on an allow verdict', async () => {
            seedRealms();
            const actor = createAllowAllActor();
            actor.permissionEvaluator.setCompileResult({ verdict: 'allow' });

            const result = await service.getMany({}, actor);
            expect(ids(result)).toEqual(['e-1', 'e-2', 'e-3']);
            expect(result.meta.total).toBe(3);
        });

        it('should apply a conditional verdict', async () => {
            seedRealms();
            const actor = createAllowAllActor();
            actor.permissionEvaluator.setCompileResult({ verdict: 'conditional', condition: eq('realmId', 'realm-2') });

            expect(ids(await service.getMany({}, actor))).toEqual(['e-2']);
        });

        it('should narrow a post verdict to the actor realm', async () => {
            seedRealms();

            expect(ids(await service.getMany({}, createAllowAllActor('realm-1')))).toEqual(['e-1']);
        });

        it('should return nothing on a deny verdict', async () => {
            seedRealms();
            const actor = createAllowAllActor();
            actor.permissionEvaluator.setCompileResult({ verdict: 'deny' });

            expect(ids(await service.getMany({}, actor))).toEqual([]);
        });

        it('should check permission', async () => {
            const actor = createAllowAllActor();
            await service.getMany({}, actor);

            // Pin the one-of: dropping EVENT_DELETE would 403 delete-only roles.
            const names = [PermissionName.EVENT_READ, PermissionName.EVENT_DELETE];
            expect(actor.permissionEvaluator.preEvaluateOneOfCalls[0].name).toEqual(names);
            expect(actor.permissionEvaluator.compileCalls[0].name).toEqual(names);
        });

        it('should throw PermissionDeniedError when actor lacks permission', async () => {
            await expect(
                service.getMany({}, createDenyAllActor()),
            ).rejects.toThrow(PermissionDeniedError);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            const event = createTestEvent({ id: 'e-1' });
            repository.seed(event);

            const result = await service.getOne('e-1', createAllowAllActor('realm-1'));
            expect(result.id).toBe('e-1');
        });

        it('should throw EntityNotFoundError for an entity out of reach', async () => {
            repository.seed(createTestEvent({ id: 'e-1', realmId: 'realm-2' }));

            await expect(
                service.getOne('e-1', createAllowAllActor('realm-1')),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.getOne('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should throw PermissionDeniedError when actor lacks permission', async () => {
            const event = createTestEvent({ id: 'e-1' });
            repository.seed(event);

            await expect(
                service.getOne('e-1', createDenyAllActor()),
            ).rejects.toThrow(PermissionDeniedError);
        });
    });

    describe('create', () => {
        it('should create with valid data', async () => {
            const result = await service.create(
                {
                    refType: 'analysis',
                    scope: 'entity',
                    name: 'created',
                },
                createAllowAllActor(),
            );

            expect(result.refType).toBe('analysis');
            expect(result.scope).toBe('entity');
            expect(result.name).toBe('created');
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should throw PermissionDeniedError when actor lacks permission', async () => {
            await expect(
                service.create(
                    {
                        refType: 'analysis',
                        scope: 'entity',
                        name: 'created',
                    },
                    createDenyAllActor(),
                ),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should set realmId from actor when not provided', async () => {
            const actor = createMasterRealmActor('my-realm');

            const result = await service.create(
                {
                    refType: 'analysis',
                    scope: 'entity',
                    name: 'created',
                },
                actor,
            );

            expect(result.realmId).toBe('my-realm');
        });

        it('should throw PermissionDeniedError when non-master realm sets different realmId', async () => {
            const actor = createNonMasterRealmActor('realm-1');
            const otherRealmId = randomUUID();

            await expect(
                service.create(
                    {
                        refType: 'analysis',
                        scope: 'entity',
                        name: 'created',
                        realmId: otherRealmId,
                    },
                    actor,
                ),
            ).rejects.toThrow(PermissionDeniedError);
        });

        // Column bounds live in the released 1771519574696 migration and are
        // invisible to CI: the sqlite leg ignores varchar length, and the
        // pg/mysql legs build their schema with `dataSource.synchronize()`
        // from the entity. Without this the validator's literals are unpinned.
        // `scope` is bounded by the closed EventScope vocabulary instead.
        it.each([
            ['scope', 'model'], // outside EventScope
            ['name', 'x'.repeat(65)],
            ['refType', 'x'.repeat(65)],
            ['expiresAt', '2026-01-01T00:00:00.12345678Z'], // 29 chars > varchar(28)
            ['expiring', null], // column is NOT NULL
        ])('should reject an out-of-bounds %s', async (key, value) => {
            await expect(service.create(
                {
                    refType: 'analysis',
                    scope: 'entity',
                    name: 'created',
                    [key as string]: value,
                },
                createAllowAllActor(),
            )).rejects.toThrow();
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

        it('should throw PermissionDeniedError when actor lacks permission', async () => {
            const event = createTestEvent();
            repository.seed(event);

            await expect(
                service.delete(event.id, createDenyAllActor()),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should enforce realm writability for non-master realm', async () => {
            const event = createTestEvent({ realmId: 'other-realm' });
            repository.seed(event);

            await expect(
                service.delete(event.id, createNonMasterRealmActor('realm-1')),
            ).rejects.toThrow(PermissionDeniedError);
        });

        it('should allow master realm to delete any event', async () => {
            const event = createTestEvent({ realmId: 'other-realm' });
            repository.seed(event);

            const result = await service.delete(event.id, createMasterRealmActor());
            expect(result.id).toBe(event.id);
        });

        it('should allow delete when event has no realmId', async () => {
            const event = createTestEvent({ realmId: null });
            repository.seed(event);

            const result = await service.delete(event.id, createNonMasterRealmActor('realm-1'));
            expect(result.id).toBe(event.id);
        });
    });
});
