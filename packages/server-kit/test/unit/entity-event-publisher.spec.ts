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
import { EntityEventPublisher } from '../../src';
import type { EntityEventHandleOptions, IEntityEventHandler } from '../../src';

function createTestPublishContext() {
    return {
        data: { id: '1', name: 'test' },
        metadata: {
            ref_type: 'testEntity',
            ref_id: '1',
            event: 'created',
        },
        destinations: [
            { channel: 'test-channel' },
        ],
    };
}

describe('src/entity-event/publisher', () => {
    it('should call all registered handlers on publish', async () => {
        const handler1: IEntityEventHandler = { handle: vi.fn() };
        const handler2: IEntityEventHandler = { handle: vi.fn() };

        const publisher = new EntityEventPublisher();
        publisher.register(handler1);
        publisher.register(handler2);

        await publisher.publish(createTestPublishContext());

        expect(handler1.handle).toHaveBeenCalledOnce();
        expect(handler2.handle).toHaveBeenCalledOnce();
    });

    it('should not call handlers when none are registered', async () => {
        const publisher = new EntityEventPublisher();

        // should not throw
        await publisher.publish(createTestPublishContext());
    });

    it('should pass resolved destinations to handlers', async () => {
        const handleMock = vi.fn();
        const handler: IEntityEventHandler = { handle: handleMock };

        const publisher = new EntityEventPublisher();
        publisher.register(handler);

        const ctx = {
            data: { id: '1' },
            metadata: { ref_type: 'test', event: 'created' },
            destinations: [
                { channel: 'ch1', namespace: 'ns1' },
                { channel: 'ch2' },
            ],
        };

        await publisher.publish(ctx);

        const passedCtx = handleMock.mock.calls[0][0] as EntityEventHandleOptions;
        expect(passedCtx.destinations).toHaveLength(2);
        expect(passedCtx.destinations[0].channel).toBe('ch1');
        expect(passedCtx.destinations[0].namespace).toBe('ns1');
    });

    it('should resolve destination functions before passing to handlers', async () => {
        const handleMock = vi.fn();
        const handler: IEntityEventHandler = { handle: handleMock };

        const publisher = new EntityEventPublisher();
        publisher.register(handler);

        const ctx = {
            data: { id: '1', realm_id: 'realm-abc' },
            metadata: { ref_type: 'test', event: 'created' },
            destinations: (data: any) => [
                { channel: `realm/${data.realm_id}` },
            ],
        };

        await publisher.publish(ctx);

        const passedCtx = handleMock.mock.calls[0][0] as EntityEventHandleOptions;
        expect(passedCtx.destinations).toHaveLength(1);
        expect(passedCtx.destinations[0].channel).toBe('realm/realm-abc');
    });

    it('should swallow handler errors in safePublish and log them', async () => {
        const errorMock = vi.fn();
        const logger = { error: errorMock, debug: vi.fn() } as any;

        const failingHandler: IEntityEventHandler = { handle: vi.fn().mockRejectedValue(new Error('handler failed')) };

        const publisher = new EntityEventPublisher({ logger });
        publisher.register(failingHandler);

        // should not throw
        await publisher.safePublish(createTestPublishContext());

        expect(errorMock).toHaveBeenCalled();
    });

    it('should propagate handler errors in publish', async () => {
        const failingHandler: IEntityEventHandler = { handle: vi.fn().mockRejectedValue(new Error('handler failed')) };

        const publisher = new EntityEventPublisher();
        publisher.register(failingHandler);

        await expect(publisher.publish(createTestPublishContext())).rejects.toThrow('handler failed');
    });
});
