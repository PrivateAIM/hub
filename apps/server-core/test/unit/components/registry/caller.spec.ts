/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentStatus, IComponent, Message } from 'synergos';
import { MemoryMessageBusDriver, MessageBus, WorkerCaller } from 'synergos';
import { describe, expect, it } from 'vitest';
import { RegistryComponentCaller } from '../../../../src/app/components/registry/caller/module.ts';
import { RegistryCommand, RegistryTaskMessageBusRouting } from '../../../../src/app/components/registry/constants.ts';

class FakeRegistryComponent implements IComponent {
    readonly handled: string[] = [];

    start(): Promise<void> {
        return Promise.resolve();
    }

    stop(): Promise<void> {
        return Promise.resolve();
    }

    status(): ComponentStatus {
        return {};
    }

    async handle(key: string): Promise<void> {
        this.handled.push(key);
    }
}

describe('src/app/components/registry/caller', () => {
    it('dispatches through the registry task queue, never in-process', async () => {
        const messageBus = new MessageBus({ driver: new MemoryMessageBusDriver() });
        const received: Message[] = [];
        await messageBus.consumeAny(RegistryTaskMessageBusRouting, async (payload) => {
            received.push(payload);
        });

        const caller = new RegistryComponentCaller({ messageBus });
        await caller.call(RegistryCommand.SETUP, { id: 'registry' }, {});

        expect(received).toHaveLength(1);
        expect(received[0]).toMatchObject({
            type: RegistryCommand.SETUP,
            data: { id: 'registry' },
            metadata: { routing: RegistryTaskMessageBusRouting },
        });
    });

    it('reaches the in-process worker caller over the memory driver (no AMQP)', async () => {
        const messageBus = new MessageBus({ driver: new MemoryMessageBusDriver() });
        const component = new FakeRegistryComponent();
        const worker = new WorkerCaller(component, {
            consumeRouting: RegistryTaskMessageBusRouting,
            messageBus,
        });
        await worker.start();

        const caller = new RegistryComponentCaller({ messageBus });
        await caller.call(RegistryCommand.PROJECT_LINK, { id: 'project' }, {});

        expect(component.handled).toEqual([RegistryCommand.PROJECT_LINK]);
        await worker.stop();
    });
});
