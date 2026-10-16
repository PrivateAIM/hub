/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Component, ComponentHandleFnArgsForMap, MessageBusPayload } from '@privateaim/server-kit';
import { MemoryMessageBusDriver, MessageBus } from '@privateaim/server-kit';
import { describe, expect, it } from 'vitest';
import { RegistryComponentCaller } from '../../../../../src/app/components/registry/caller/index.ts';
import { RegistryCommand, RegistryTaskMessageBusRouting } from '../../../../../src/app/components/registry/constants.ts';
import type { RegistryEventMap } from '../../../../../src/app/components/registry/type.ts';

class FakeRegistryComponent implements Component<RegistryEventMap> {
    readonly handled: { key: string, data: Record<string, any> }[] = [];

    failing = false;

    start() {}

    async handle(...[key, data]: ComponentHandleFnArgsForMap<RegistryEventMap>) {
        if (this.failing) {
            throw new Error('harbor unavailable');
        }

        this.handled.push({ key, data });
    }
}

describe('RegistryComponentCaller', () => {
    it('should only dispatch through the message bus when one is configured', async () => {
        // The component must never run in-process here, not even first.
        const component = new FakeRegistryComponent();

        const messageBus = new MessageBus({ driver: new MemoryMessageBusDriver() });
        const consumed: MessageBusPayload[] = [];
        await messageBus.consumeAny(RegistryTaskMessageBusRouting, (payload) => {
            consumed.push(payload);
        });

        const caller = new RegistryComponentCaller(component, { messageBus });
        await caller.call(RegistryCommand.PROJECT_LINK, { id: 'project-1' }, {});

        expect(component.handled).toEqual([]);
        expect(consumed).toHaveLength(1);
        expect(consumed[0].type).toEqual(RegistryCommand.PROJECT_LINK);
        expect(consumed[0].data).toEqual({ id: 'project-1' });
    });

    it('should run the command in-process when the bus accepts it nowhere', async () => {
        // memory driver with no consumer registered (yet): publish resolves false
        const component = new FakeRegistryComponent();
        const messageBus = new MessageBus({ driver: new MemoryMessageBusDriver() });

        const caller = new RegistryComponentCaller(component, { messageBus });
        await caller.call(RegistryCommand.PROJECT_LINK, { id: 'project-1' }, {});

        expect(component.handled).toEqual([{ key: RegistryCommand.PROJECT_LINK, data: { id: 'project-1' } }]);
    });

    it('should call the component directly without a message bus', async () => {
        const component = new FakeRegistryComponent();

        const caller = new RegistryComponentCaller(component);
        await caller.call(RegistryCommand.PROJECT_LINK, { id: 'project-1' }, {});

        expect(component.handled).toEqual([{ key: RegistryCommand.PROJECT_LINK, data: { id: 'project-1' } }]);
    });

    it('should surface a direct call failure without a message bus', async () => {
        const component = new FakeRegistryComponent();
        component.failing = true;

        const caller = new RegistryComponentCaller(component);

        await expect(caller.call(RegistryCommand.PROJECT_LINK, { id: 'project-1' }, {}))
            .rejects.toThrow('harbor unavailable');
    });
});
