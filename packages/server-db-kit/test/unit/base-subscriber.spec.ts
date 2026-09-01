/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { 
    describe, 
    expect, 
    it, 
    vi, 
} from 'vitest';
import type { IEntityEventPublisher } from '@privateaim/server-kit';
import { DomainEventName } from '@privateaim/kit';
import { BaseSubscriber } from '../../src';

function createMockPublisher(): IEntityEventPublisher {
    return {
        publish: vi.fn(),
        safePublish: vi.fn(),
    };
}

function createMockInsertEvent(entity: Record<string, any>) {
    return {
        entity,
        queryRunner: { data: {} },
    } as any;
}

function createMockUpdateEvent(entity: Record<string, any>, previous: Record<string, any>) {
    return {
        entity,
        databaseEntity: previous,
        queryRunner: { data: {} },
    } as any;
}

function createMockRemoveEvent(entity: Record<string, any>) {
    return {
        entity,
        queryRunner: { data: {} },
    } as any;
}

describe('src/subscriber/base', () => {
    it('should publish entity events when publisher is set via constructor', async () => {
        const publisher = createMockPublisher();

        const subscriber = new BaseSubscriber({
            refType: 'testEntity',
            destinations: [{ channel: 'test' }],
            publisher,
        });

        await subscriber.afterInsert(createMockInsertEvent({ id: '1' }));

        expect(publisher.safePublish).toHaveBeenCalledOnce();
        const ctx = (publisher.safePublish as any).mock.calls[0][0];
        expect(ctx.metadata.refType).toBe('testEntity');
        expect(ctx.metadata.event).toBe(DomainEventName.CREATED);
    });

    it('should publish entity events when publisher is set via setPublisher', async () => {
        const publisher = createMockPublisher();

        const subscriber = new BaseSubscriber({
            refType: 'testEntity',
            destinations: [{ channel: 'test' }],
        });

        // No publisher yet — should not throw
        await subscriber.afterInsert(createMockInsertEvent({ id: '1' }));
        expect(publisher.safePublish).not.toHaveBeenCalled();

        // Now set publisher via late binding
        subscriber.setPublisher(publisher);

        await subscriber.afterInsert(createMockInsertEvent({ id: '2' }));
        expect(publisher.safePublish).toHaveBeenCalledOnce();
    });

    it('should silently skip publishing when no publisher is set', async () => {
        const subscriber = new BaseSubscriber({
            refType: 'testEntity',
            destinations: [{ channel: 'test' }],
        });

        // should not throw
        await subscriber.afterInsert(createMockInsertEvent({ id: '1' }));
        await subscriber.afterUpdate(createMockUpdateEvent({ id: '1' }, { id: '1' }));
        await subscriber.beforeRemove(createMockRemoveEvent({ id: '1' }));
    });

    it('should publish correct event types for insert, update, remove', async () => {
        const publisher = createMockPublisher();

        const subscriber = new BaseSubscriber({
            refType: 'testEntity',
            destinations: [{ channel: 'test' }],
            publisher,
        });

        await subscriber.afterInsert(createMockInsertEvent({ id: '1' }));
        await subscriber.afterUpdate(createMockUpdateEvent({ id: '1', name: 'new' }, { id: '1', name: 'old' }));
        await subscriber.beforeRemove(createMockRemoveEvent({ id: '1' }));

        expect(publisher.safePublish).toHaveBeenCalledTimes(3);

        const { calls } = (publisher.safePublish as any).mock;
        expect(calls[0][0].metadata.event).toBe(DomainEventName.CREATED);
        expect(calls[1][0].metadata.event).toBe(DomainEventName.UPDATED);
        expect(calls[1][0].dataPrevious).toEqual({ id: '1', name: 'old' });
        expect(calls[2][0].metadata.event).toBe(DomainEventName.DELETED);
    });

    it('should not publish on remove when entity is undefined', async () => {
        const publisher = createMockPublisher();

        const subscriber = new BaseSubscriber({
            refType: 'testEntity',
            destinations: [{ channel: 'test' }],
            publisher,
        });

        await subscriber.beforeRemove({ entity: undefined, queryRunner: { data: {} } } as any);
        expect(publisher.safePublish).not.toHaveBeenCalled();
    });

    it('should not publish columns declared select:false', async () => {
        // `registryProject.accountSecret` reached the `/resources` socket rooms and
        // the telemetry audit diff verbatim. The strip is metadata-derived, so
        // `select: false` stays the single declaration.
        const publisher = createMockPublisher();

        const subscriber = new BaseSubscriber({
            refType: 'registryProject',
            destinations: [{ channel: 'test' }],
            publisher,
        });

        const entity = { id: '1', accountSecret: 'NEW' };
        await subscriber.afterUpdate({
            entity,
            databaseEntity: { id: '1', accountSecret: 'OLD' },
            queryRunner: { data: {} },
            metadata: {
                columns: [
                    { propertyPath: 'id', isSelect: true },
                    { propertyPath: 'accountSecret', isSelect: false },
                ],
            },
        } as any);

        const ctx = (publisher.safePublish as any).mock.calls[0][0];
        expect(ctx.data).toEqual({ id: '1' });
        expect(ctx.dataPrevious).toEqual({ id: '1' });
        // negative control: a copy, not a mutation — the registry link handler
        // keeps using the live entity's secret after the save that fires this hook.
        expect(entity.accountSecret).toBe('NEW');
    });
});
