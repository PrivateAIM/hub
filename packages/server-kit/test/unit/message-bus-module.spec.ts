/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Container } from 'eldin';
import type {
    IMessageBusConsumer,
    IMessageBusDriver,
    Message,
    MessageRouting,
} from 'hubwire';
import { MemoryMessageBusDriver } from 'hubwire';
import { describe, expect, it } from 'vitest';
import {
    MessageBusInjectionKey,
    MessageBusModule,
    RemoteMessageBusInjectionKey,
} from '../../src';

/**
 * Stands in for a driver that leaves the process (AMQP): records publishes, delivers nothing.
 */
class RecordingDriver implements IMessageBusDriver {
    published: Message[] = [];

    closed = false;

    async publish(_routing: MessageRouting, message: Message): Promise<void> {
        this.published.push(message);
    }

    async consume(): Promise<IMessageBusConsumer> {
        return { cancel: async () => {} };
    }

    async close(): Promise<void> {
        this.closed = true;
    }
}

describe('src/message-bus/di-module', () => {
    it('should not register the remote bus on the memory driver, so nothing publishes to another service', async () => {
        const container = new Container();
        const module = new MessageBusModule();
        await module.setup(container);

        expect(container.tryResolve(MessageBusInjectionKey).success).toBe(true);
        expect(container.tryResolve(RemoteMessageBusInjectionKey).success).toBe(false);

        await module.teardown();
    });

    it('should not register the remote bus for a memory driver from a factory', async () => {
        const container = new Container();
        const module = new MessageBusModule({ driverFactory: () => new MemoryMessageBusDriver() });
        await module.setup(container);

        expect(container.tryResolve(RemoteMessageBusInjectionKey).success).toBe(false);

        await module.teardown();
    });

    it('should register the bus as remote for any other driver, and close it on teardown', async () => {
        const container = new Container();
        const driver = new RecordingDriver();
        const module = new MessageBusModule({ driverFactory: () => driver });
        await module.setup(container);

        const remote = container.tryResolve(RemoteMessageBusInjectionKey);
        expect(remote.success).toBe(true);
        expect(remote.success && remote.data).toBe(container.resolve(MessageBusInjectionKey));

        await module.teardown();
        expect(driver.closed).toBe(true);
    });
});
