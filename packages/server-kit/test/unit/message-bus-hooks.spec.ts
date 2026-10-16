/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { MemoryMessageBusDriver, MessageBus, buildMessage } from 'hubwire';
import type { MessageRouting } from 'hubwire';
import { drain } from '@hubwire/test';
import { describe, expect, it } from 'vitest';
import {
    LoggerMemoryTransport,
    createLogger,
    createMessageBusLogHooks,
} from '../../src';

const logRouting: MessageRouting = { type: 'work', key: 'log' };
const taskRouting: MessageRouting = { type: 'work', key: 'task' };

function createSuite() {
    const transport = new LoggerMemoryTransport();
    const logger = createLogger({ options: { level: 'debug' }, transports: [transport] });
    const bus = new MessageBus({
        driver: new MemoryMessageBusDriver(),
        hooks: createMessageBusLogHooks(logger, { silentRoutings: [logRouting] }),
    });

    return { transport, bus };
}

describe('src/message-bus/hooks', () => {
    it('should log a publish, but not one to a silent routing', async () => {
        const { transport, bus } = createSuite();

        await bus.publish(buildMessage({ type: 'write', metadata: { routing: logRouting } }));
        expect(transport.items).toHaveLength(0);

        const message = buildMessage({ type: 'execute', metadata: { routing: taskRouting } });
        await bus.publish(message);
        expect(transport.items).toHaveLength(1);
        expect(transport.items[0].level).toEqual('debug');
        expect(transport.items[0].message).toEqual('Publishing queue message execute in task');
        expect(transport.items[0].messageId).toEqual(message.id);
    });

    it('should log a consume of a silent routing', async () => {
        const { transport, bus } = createSuite();

        await bus.consume(logRouting, { write: () => {} });
        await bus.publish(buildMessage({ type: 'write', metadata: { routing: logRouting } }));
        await drain();

        expect(transport.items.map((item) => item.message)).toEqual(['Consuming queue message write in log']);
    });

    it('should log a failing handler at error level', async () => {
        const { transport, bus } = createSuite();

        await bus.consume(taskRouting, {
            execute: () => {
                throw new Error('boom');
            },
        });

        await bus.publish(buildMessage({ type: 'execute', metadata: { routing: taskRouting } }));
        await drain();

        const errors = transport.items.filter((item) => item.level === 'error');
        expect(errors.map((item) => item.message)).toEqual(['Handling queue message execute in task failed: boom']);
    });
});
