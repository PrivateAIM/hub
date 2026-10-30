/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Event } from '@privateaim/telemetry-kit';
import { BuiltInPolicyType, PermissionError } from '@authup/access';
import { EntityNotFoundError } from '@privateaim/errors';
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
    createScopedActor,
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
        const seedEventsAcrossRealms = () => repository.seed([
            createTestEvent({ id: 'e-1', realmId: 'realm-1' }),
            createTestEvent({ id: 'e-2', realmId: 'realm-2' }),
            createTestEvent({ id: 'e-3', realmId: null }),
        ]);

        const sortedIds = (result: { data: Event[] }) => result.data.map((e) => e.id).sort();

        it('should return events of every realm on an allow verdict', async () => {
            seedEventsAcrossRealms();

            const actor = createAllowAllActor();

            actor.permissionEvaluator.setCompileResult({ verdict: 'allow' });

            const result = await service.getMany({}, actor);

            expect(sortedIds(result)).toEqual(['e-1', 'e-2', 'e-3']);
            expect(result.meta.total).toBe(3);
        });

        it('should return only matching events on a conditional verdict', async () => {
            seedEventsAcrossRealms();

            const actor = createAllowAllActor();

            actor.permissionEvaluator.setCompileResult({ verdict: 'conditional', condition: eq('realmId', 'realm-2') });

            expect(sortedIds(await service.getMany({}, actor))).toEqual(['e-2']);
        });

        it('should return only the actor realm\'s events on a post verdict', async () => {
            seedEventsAcrossRealms();

            expect(sortedIds(await service.getMany({}, createAllowAllActor('realm-1')))).toEqual(['e-1']);
        });

        it('should return nothing on a deny verdict', async () => {
            seedEventsAcrossRealms();

            const actor = createAllowAllActor();

            actor.permissionEvaluator.setCompileResult({ verdict: 'deny' });

            expect(sortedIds(await service.getMany({}, actor))).toEqual([]);
        });

        it('should accept either EVENT_READ or EVENT_DELETE as read permission', async () => {
            const actor = createAllowAllActor();

            await service.getMany({}, actor);

            // Pin the one-of: dropping EVENT_DELETE would 403 delete-only roles.
            const names = [PermissionName.EVENT_READ, PermissionName.EVENT_DELETE];

            expect(actor.permissionEvaluator.preEvaluateOneOfCalls[0].name).toEqual(names);
            expect(actor.permissionEvaluator.compileCalls[0].name).toEqual(names);
        });

        it('should deny when actor lacks permission', async () => {
            await expect(
                service.getMany({}, createDenyAllActor()),
            ).rejects.toThrow(PermissionError);
        });
    });

    describe('getOne', () => {
        it('should return entity by ID', async () => {
            const event = createTestEvent({ id: 'e-1' });

            repository.seed(event);

            const result = await service.getOne('e-1', createAllowAllActor('realm-1'));

            expect(result.id).toBe('e-1');
        });

        it('should throw EntityNotFoundError for an entity in another realm', async () => {
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

        it('should deny when actor lacks permission', async () => {
            const event = createTestEvent({ id: 'e-1' });

            repository.seed(event);

            await expect(
                service.getOne('e-1', createDenyAllActor()),
            ).rejects.toThrow(PermissionError);
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

        it('should deny when actor lacks permission', async () => {
            await expect(
                service.create(
                    {
                        refType: 'analysis',
                        scope: 'entity',
                        name: 'created',
                    },
                    createDenyAllActor(),
                ),
            ).rejects.toThrow(PermissionError);
        });

        it('should set realmId from actor when not provided', async () => {
            const actor = createAllowAllActor('my-realm');

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

        it('should evaluate EVENT_CREATE against the actor realm when none is provided', async () => {
            const actor = createScopedActor({ realmScope: 'own' });

            const result = await service.create(
                {
                    refType: 'analysis',
                    scope: 'entity',
                    name: 'created',
                },
                actor,
            );

            const [call] = actor.permissionEvaluator.evaluateCalls;

            expect(call.name).toBe(PermissionName.EVENT_CREATE);
            expect(call.data!.get(BuiltInPolicyType.REALM_MATCH)).toBe(actor.realm!.id);
            expect(result.realmId).toBe(actor.realm!.id);
        });

        it('should deny when an own-scoped grant targets another realm', async () => {
            await expect(
                service.create(
                    {
                        refType: 'analysis',
                        scope: 'entity',
                        name: 'created',
                        realmId: randomUUID(),
                    },
                    createScopedActor({ realmScope: 'own' }),
                ),
            ).rejects.toThrow(PermissionError);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should create in another realm with an any-scoped grant', async () => {
            const realmId = randomUUID();

            const result = await service.create(
                {
                    refType: 'analysis',
                    scope: 'entity',
                    name: 'created',
                    realmId,
                },
                createScopedActor({ realmScope: 'any' }),
            );

            expect(result.realmId).toBe(realmId);
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

            const result = await service.delete(event.id, createAllowAllActor());

            expect(result.id).toBe(event.id);
            expect(repository.getAll()).toHaveLength(0);
        });

        it('should deny when actor lacks permission', async () => {
            const event = createTestEvent();

            repository.seed(event);

            await expect(
                service.delete(event.id, createDenyAllActor()),
            ).rejects.toThrow(PermissionError);
        });

        it('should throw EntityNotFoundError for missing entity', async () => {
            await expect(
                service.delete('nonexistent', createAllowAllActor()),
            ).rejects.toThrow(EntityNotFoundError);
        });

        it('should deny when the grant does not reach the event realm', async () => {
            const event = createTestEvent({ realmId: 'other-realm' });

            repository.seed(event);

            await expect(
                service.delete(event.id, createScopedActor({ realmId: 'realm-1', realmScope: 'own' })),
            ).rejects.toThrow(PermissionError);
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should delete an event of another realm with an any-scoped grant', async () => {
            const event = createTestEvent({ realmId: 'other-realm' });

            repository.seed(event);

            const actor = createScopedActor({ realmId: 'realm-1', realmScope: 'any' });
            const result = await service.delete(event.id, actor);

            expect(result.id).toBe(event.id);
            expect(actor.permissionEvaluator.evaluateCalls[0].name).toBe(PermissionName.EVENT_DELETE);
        });

        it('should deny for a realm-less event with an own-scoped grant', async () => {
            const event = createTestEvent({ realmId: null });

            repository.seed(event);

            await expect(
                service.delete(event.id, createScopedActor({ realmId: 'realm-1', realmScope: 'own' })),
            ).rejects.toThrow(PermissionError);
            expect(repository.getAll()).toHaveLength(1);
        });

        it('should delete a realm-less event with an ownOrNull-scoped grant', async () => {
            const event = createTestEvent({ realmId: null });

            repository.seed(event);

            const actor = createScopedActor({ realmId: 'realm-1', realmScope: 'ownOrNull' });
            const result = await service.delete(event.id, actor);

            expect(result.id).toBe(event.id);
            expect(actor.permissionEvaluator.evaluateCalls[0].data!.get(BuiltInPolicyType.REALM_MATCH)).toBeNull();
        });
    });
});
