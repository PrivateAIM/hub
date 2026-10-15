/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import {
    BaseComponent,
    MemoryMessageBusDriver,
    MessageBus,
    MessageBusWorkerComponentCaller,
} from '../../src';
import type { ComponentHandleOptions, MessageBusPayload, MessageBusRouting } from '../../src';

type EventMap = {
    execute: [{ id: string }, Record<string, any>],
    executionFinished: [{ id: string }, Record<string, any>],
};

class TestComponent extends BaseComponent<EventMap> {
    constructor() {
        super();

        this.mount('execute', async (value, context) => {
            await context.handle('executionFinished', value);
        });
    }

    start() {}
}

describe('src/component', () => {
    it('should resolve a child handle only once the child event is handled', async () => {
        const order: string[] = [];
        const options: ComponentHandleOptions<EventMap> = {
            handle: async (_value, context) => {
                await new Promise((resolve) => {
                    setTimeout(resolve, 10);
                });
                order.push(context.key);
            },
        };

        await new TestComponent().handle('execute', { id: 'a' }, {}, options);
        order.push('done');

        expect(order).toEqual(['executionFinished', 'done']);
    });

    it('should propagate a failing child handle to the parent handler', async () => {
        const options: ComponentHandleOptions<EventMap> = {
            handle: () => {
                throw new Error('publish failed');
            },
        };

        await expect(new TestComponent().handle('execute', { id: 'a' }, {}, options))
            .rejects.toThrow('publish failed');
    });

    it('should not carry the command attempt over to its reply', async () => {
        const consumeRouting: MessageBusRouting = { type: 'work', key: 'commands' };
        const publishRouting: MessageBusRouting = { type: 'work', key: 'replies' };

        const messageBus = new MessageBus({ driver: new MemoryMessageBusDriver() });
        const replies: MessageBusPayload[] = [];
        await messageBus.consumeAny(publishRouting, (payload) => {
            replies.push(payload);
        });

        const caller = new MessageBusWorkerComponentCaller(new TestComponent(), {
            consumeRouting,
            publishRouting,
            messageBus,
        });

        await caller.call('execute', { id: 'a' }, { attempt: 3, routing: consumeRouting });

        expect(replies).toHaveLength(1);
        expect(replies[0].type).toBe('executionFinished');
        expect(replies[0].metadata.attempt).toBeUndefined();
        expect(replies[0].metadata.routing).toEqual(publishRouting);
    });
});
