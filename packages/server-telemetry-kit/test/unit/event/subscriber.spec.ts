/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { EntityEventHandleOptions } from '@privateaim/server-kit';
import { DomainType } from '@privateaim/telemetry-kit';
import { 
    beforeEach, 
    describe, 
    expect, 
    it, 
} from 'vitest';
import { EntityEventHandler } from '../../../src/core';
import { FakeEventPublisher } from './fake-caller.ts';

function buildContext(overrides: Partial<EntityEventHandleOptions> = {}): EntityEventHandleOptions {
    return {
        metadata: {
            refType: 'analysis',
            refId: 'analysis-1',
            event: 'updated',
            ...(overrides.metadata || {}),
        },
        data: { id: 'analysis-1', ...(overrides.data || {}) },
        dataPrevious: overrides.dataPrevious,
        destinations: [],
    } as EntityEventHandleOptions;
}

describe('core/event (EntityEventHandler)', () => {
    let publisher: FakeEventPublisher;
    let handler: EntityEventHandler;

    beforeEach(() => {
        publisher = new FakeEventPublisher();
        handler = new EntityEventHandler({ eventComponentCaller: publisher });
    });

    it('should not publish an event for the event domain itself', async () => {
        await handler.handle(buildContext({ metadata: { refType: DomainType.EVENT, event: 'created' } }));

        expect(publisher.created).toHaveLength(0);
    });

    it('should carry the audit metadata onto the event record', async () => {
        await handler.handle(buildContext({
            metadata: {
                refType: 'analysis',
                refId: 'analysis-1',
                event: 'created',
                actorId: 'actor-1',
                actorType: 'user',
                actorName: 'admin',
                requestPath: '/analyses',
                requestMethod: 'POST',
                requestIpAddress: '10.0.0.1',
                requestUserAgent: 'vitest',
            },
        }));

        // These keys are compiler-blind at the producing end (buildActorContext
        // fills a Partial<EntityEventMetadata>), so pin every one of them: a
        // one-sided rename would silently drop the whole audit trail.
        expect(publisher.last).toMatchObject({
            refType: 'analysis',
            refId: 'analysis-1',
            scope: 'entity',
            name: 'created',
            actorId: 'actor-1',
            actorType: 'user',
            actorName: 'admin',
            requestPath: '/analyses',
            requestMethod: 'POST',
            requestIpAddress: '10.0.0.1',
            requestUserAgent: 'vitest',
        });
    });

    it('should normalize an IPv6 loopback request address', async () => {
        await handler.handle(buildContext({
            metadata: {
                refType: 'analysis', 
                event: 'created', 
                requestIpAddress: '::1',
            },
        }));

        expect(publisher.last.requestIpAddress).toBe('127.0.0.1');
    });

    it('should diff only the changed scalar properties on an update', async () => {
        await handler.handle(buildContext({
            data: {
                id: 'analysis-1', 
                name: 'next', 
                description: 'same', 
            },
            dataPrevious: {
                id: 'analysis-1', 
                name: 'previous', 
                description: 'same', 
            },
        }));

        expect(publisher.last.data).toEqual({ diff: { name: { next: 'next', previous: 'previous' } } });
    });

    it('should exclude timestamp properties from the diff', async () => {
        // Regression guard for plan 017: the exclusion used to be
        // `key.endsWith('_at')`, which matches NOTHING once the properties are
        // camelCase — every single update would have recorded timestamp churn.
        await handler.handle(buildContext({
            data: {
                id: 'analysis-1', 
                name: 'same', 
                createdAt: 'b', 
                updatedAt: 'b', 
                expiresAt: 'b',
            },
            dataPrevious: {
                id: 'analysis-1', 
                name: 'same', 
                createdAt: 'a', 
                updatedAt: 'a', 
                expiresAt: 'a',
            },
        }));

        expect(publisher.last.data).toEqual({ diff: {} });
    });

    it('should skip object and array valued properties in the diff', async () => {
        await handler.handle(buildContext({
            data: {
                id: 'analysis-1', 
                labels: { a: '2' }, 
                nodes: ['b'], 
            },
            dataPrevious: {
                id: 'analysis-1', 
                labels: { a: '1' }, 
                nodes: ['a'], 
            },
        }));

        expect(publisher.last.data).toEqual({ diff: {} });
    });

    it('should not diff when the event is not an update', async () => {
        await handler.handle(buildContext({
            metadata: { refType: 'analysis', event: 'created' },
            data: { id: 'analysis-1', name: 'next' },
            dataPrevious: { id: 'analysis-1', name: 'previous' },
        }));

        expect(publisher.last.data).toEqual({});
    });

    it('should mark published events as expiring', async () => {
        await handler.handle(buildContext({ metadata: { refType: 'analysis', event: 'created' } }));

        expect(publisher.last.expiring).toBe(true);
        expect(Date.parse(publisher.last.expiresAt as string)).toBeGreaterThan(Date.now());
    });

    it('should not throw when no publisher is available', async () => {
        const detached = new EntityEventHandler();

        await expect(detached.handle(buildContext())).resolves.toBeUndefined();
    });
});
