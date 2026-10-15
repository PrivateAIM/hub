/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Node } from '@privateaim/core-kit';
import { 
    afterEach, 
    describe, 
    expect, 
    it, 
} from 'vitest';
import type { NodeClientComponent } from '../../../../../src/app/components/node-client/index.ts';
import { createNodeClientComponent } from '../../../../../src/app/components/node-client/index.ts';
import { FakeNodeRepository } from '../../../core/entities/node/fake-repository.ts';

class FakeNodeClientService {
    readonly calls: string[] = [];

    failing = false;

    async assignPermissions(clientId: string): Promise<void> {
        if (this.failing) {
            throw new Error('authup unavailable');
        }

        this.calls.push(clientId);
    }
}

function createRepository() {
    const repository = new FakeNodeRepository();
    repository.seed([
        {
            id: 'node-1', 
            name: 'node-1', 
            clientId: 'client-1', 
        },
    ] as Node[]);
    return repository;
}

describe('createNodeClientComponent', () => {
    let component: NodeClientComponent | undefined;

    afterEach(async () => {
        // stop() unschedules the cron task, which would otherwise keep the
        // worker alive.
        await component?.stop();
        component = undefined;
    });

    it('should sync once at start, inside the lock', async () => {
        const nodeClientService = new FakeNodeClientService();
        let locked = 0;

        component = createNodeClientComponent({
            repository: createRepository(),
            nodeClientService,
            lock: async (fn) => {
                locked++;
                return fn();
            },
        });

        await component.start();

        expect(locked).toBe(1);
        expect(nodeClientService.calls).toEqual(['client-1']);
        expect(component.status().lastSuccessAt).toBeTypeOf('number');
        expect(component.status().runningSince).toBeUndefined();
    });

    it('should not report success when a node fails', async () => {
        const nodeClientService = new FakeNodeClientService();
        nodeClientService.failing = true;

        component = createNodeClientComponent({
            repository: createRepository(),
            nodeClientService,
            lock: (fn) => fn(),
        });

        await component.start();

        expect(component.status().lastSuccessAt).toBeUndefined();
    });

    it('should not reject start when the pass itself fails', async () => {
        component = createNodeClientComponent({
            repository: createRepository(),
            nodeClientService: new FakeNodeClientService(),
            lock: async () => {
                throw new Error('lock timeout');
            },
        });

        await expect(component.start()).resolves.toBeUndefined();
        expect(component.status().lastSuccessAt).toBeUndefined();
    });
});
