/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    ComponentStatus,
    IComponent,
    Message,
} from 'hubwire';
import { MemoryMessageBusDriver, MessageBus, RemoteWorker } from 'hubwire';
import { drain } from '@hubwire/test';
import { describe, expect, it } from 'vitest';
import { RegistryComponentDispatcher } from '../../../../../src/app/components/registry/dispatcher/index.ts';
import { RegistryCommand, RegistryTaskMessageBusRouting } from '../../../../../src/app/components/registry/constants.ts';
import type { RegistryEventMap } from '../../../../../src/app/components/registry/type.ts';

class FakeRegistryComponent implements IComponent<RegistryEventMap> {
    readonly handled: { key: string, data: Record<string, any> }[] = [];

    failing = false;

    start(): Promise<void> {
        return Promise.resolve();
    }

    stop(): Promise<void> {
        return Promise.resolve();
    }

    status(): ComponentStatus {
        return {};
    }

    async handle(key: string, data: Record<string, any>): Promise<void> {
        if (this.failing) {
            throw new Error('harbor unavailable');
        }

        this.handled.push({ key, data });
    }
}

describe('RegistryComponentDispatcher', () => {
    it('should only dispatch through the message bus when one is configured', async () => {
        // The component must never run in-process here, not even first.
        const component = new FakeRegistryComponent();

        const messageBus = new MessageBus({ driver: new MemoryMessageBusDriver() });
        const consumed: Message[] = [];
        await messageBus.consumeAny(RegistryTaskMessageBusRouting, (message) => {
            consumed.push(message);
        });

        const dispatcher = new RegistryComponentDispatcher(component, { messageBus });
        await dispatcher.dispatch(RegistryCommand.PROJECT_LINK, { id: 'project-1' }, {});
        await drain();

        expect(component.handled).toEqual([]);
        expect(consumed).toHaveLength(1);
        expect(consumed[0]).toMatchObject({
            type: RegistryCommand.PROJECT_LINK,
            data: { id: 'project-1' },
            metadata: { routing: RegistryTaskMessageBusRouting },
        });
    });

    it('should reach the in-process remote worker over the memory driver (no AMQP)', async () => {
        const messageBus = new MessageBus({ driver: new MemoryMessageBusDriver() });
        const worker = new FakeRegistryComponent();
        const remoteWorker = new RemoteWorker(worker, {
            consume: RegistryTaskMessageBusRouting,
            messageBus,
        });
        await remoteWorker.start();

        // a different instance: the command must arrive through the bus
        const component = new FakeRegistryComponent();
        const dispatcher = new RegistryComponentDispatcher(component, { messageBus });
        await dispatcher.dispatch(RegistryCommand.PROJECT_LINK, { id: 'project-1' }, {});
        await drain();

        expect(component.handled).toEqual([]);
        expect(worker.handled).toEqual([{ key: RegistryCommand.PROJECT_LINK, data: { id: 'project-1' } }]);
        await remoteWorker.stop();
    });

    it('should keep a command dispatched before the worker started', async () => {
        const messageBus = new MessageBus({ driver: new MemoryMessageBusDriver() });

        const component = new FakeRegistryComponent();
        const dispatcher = new RegistryComponentDispatcher(component, { messageBus });
        await dispatcher.dispatch(RegistryCommand.PROJECT_LINK, { id: 'project-1' }, {});

        const worker = new FakeRegistryComponent();
        const remoteWorker = new RemoteWorker(worker, {
            consume: RegistryTaskMessageBusRouting,
            messageBus,
        });
        await remoteWorker.start();
        await drain();

        expect(component.handled).toEqual([]);
        expect(worker.handled).toEqual([{ key: RegistryCommand.PROJECT_LINK, data: { id: 'project-1' } }]);
        await remoteWorker.stop();
    });

    it('should call the component directly without a message bus', async () => {
        const component = new FakeRegistryComponent();

        const dispatcher = new RegistryComponentDispatcher(component);
        await dispatcher.dispatch(RegistryCommand.PROJECT_LINK, { id: 'project-1' }, {});

        expect(component.handled).toEqual([{ key: RegistryCommand.PROJECT_LINK, data: { id: 'project-1' } }]);
    });

    it('should surface a direct call failure without a message bus', async () => {
        const component = new FakeRegistryComponent();
        component.failing = true;

        const dispatcher = new RegistryComponentDispatcher(component);

        await expect(dispatcher.dispatch(RegistryCommand.PROJECT_LINK, { id: 'project-1' }, {}))
            .rejects.toThrow('harbor unavailable');
    });
});
