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
import { QueueDispatchComponentCaller } from '../../src';
import type { MessageBus, MessageBusRouting } from '../../src';

const testQueue: MessageBusRouting = {
    type: 'work',
    key: 'test-queue',
};

describe('src/component/caller/queue-dispatch', () => {
    it('should publish via messageBus when provided', async () => {
        const publishMock = vi.fn().mockResolvedValue(true);
        const messageBus = { publish: publishMock } as unknown as MessageBus;

        const caller = new QueueDispatchComponentCaller({
            queue: testQueue,
            messageBus,
        });

        await caller.call('testCommand', { id: '123' }, {});

        expect(publishMock).toHaveBeenCalledOnce();
        const payload = publishMock.mock.calls[0][0];
        expect(payload.type).toBe('testCommand');
        expect(payload.data).toEqual({ id: '123' });
        expect(payload.metadata.routing).toEqual(testQueue);
    });

    it('should silently skip when messageBus is not provided', async () => {
        const caller = new QueueDispatchComponentCaller({ queue: testQueue });

        // should not throw
        await caller.call('testCommand', { id: '123' }, {});
    });

    it('should log warning when messageBus is missing but logger is provided', async () => {
        const warnMock = vi.fn();
        const logger = { warn: warnMock } as any;

        const caller = new QueueDispatchComponentCaller({
            queue: testQueue,
            logger,
        });

        await caller.call('testCommand', { id: '123' }, {});

        expect(warnMock).toHaveBeenCalledOnce();
        expect(warnMock.mock.calls[0][0]).toContain('testCommand');
    });

    it('should pass options through from subclass constructor', async () => {
        const publishMock = vi.fn().mockResolvedValue(true);
        const messageBus = { publish: publishMock } as unknown as MessageBus;

        // Simulate subclass pattern: spread options, override queue
        const subclassQueue: MessageBusRouting = {
            type: 'work',
            key: 'subclass-queue',
        };

        const caller = new QueueDispatchComponentCaller({
            ...{ messageBus },
            queue: subclassQueue,
        });

        await caller.call('someCommand', { data: true }, {});

        expect(publishMock).toHaveBeenCalledOnce();
        const payload = publishMock.mock.calls[0][0];
        expect(payload.metadata.routing).toEqual(subclassQueue);
    });
});
