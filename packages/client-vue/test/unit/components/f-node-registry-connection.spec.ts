/*
 * Copyright (c) 2026.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import FNodeRegistryConnection from '../../../src/components/node/FNodeRegistryConnection.vue';
import { mountClientVueComponent } from '../../utils';

/**
 * A node is assigned a registry when it is created, so it reaches this tab
 * already connected. Re-assigning must therefore be reachable FROM the
 * connected state — the server does it in a single update, and forcing a
 * Disconnect first would destroy the registry project (and its robot account)
 * for nothing.
 */
const NODE_ID = 'node-1';

const flush = () => new Promise((resolve) => { setTimeout(resolve, 0); });

function mountConnection(registryId: string | null) {
    return mountClientVueComponent(
        FNodeRegistryConnection,
        {
            entity: {
                id: NODE_ID,
                name: 'test-node',
                realmId: 'realm-1',
                registryId,
                registryProjectId: registryId ? 'project-1' : null,
            },
        },
        {
            core: {
                'GET /registries': () => ({
                    data: [{ id: 'registry-1', name: 'first' }, { id: 'registry-2', name: 'second' }],
                    meta: { total: 2 },
                }),
                'POST /nodes/:id': (request) => ({
                    data: { id: NODE_ID, ...(request.body as any) },
                    meta: {},
                }),
            },
        },
    );
}

function updateBodies(coreClient: ReturnType<typeof mountConnection>['coreClient']) {
    return coreClient.requests
        .filter((request) => request.method === 'POST' && request.url.includes('/nodes/'))
        .map((request) => request.body as Record<string, any>);
}

describe('FNodeRegistryConnection', () => {
    it('should switch a connected node to another registry in a single update', async () => {
        const { wrapper, coreClient } = mountConnection('registry-1');

        await flush();

        // The currently assigned registry offers no select button, so the only
        // selectable row is the other one.
        // `attributes('disabled')` is '' — falsy — on a disabled button, so the
        // DOM property is what actually separates them.
        const selectable = wrapper.findAll('button').filter((button) => !(button.element as HTMLButtonElement).disabled);
        await selectable[0].trigger('click');
        await flush();

        await wrapper.findAll('button')
            .find((button) => button.text().includes('Switch'))
            .trigger('click');
        await flush();

        expect(updateBodies(coreClient)).toEqual([{ registryId: 'registry-2' }]);
    });

    it('should connect a disconnected node', async () => {
        const { wrapper, coreClient } = mountConnection(null);

        await flush();

        // `attributes('disabled')` is '' — falsy — on a disabled button, so the
        // DOM property is what actually separates them.
        const selectable = wrapper.findAll('button').filter((button) => !(button.element as HTMLButtonElement).disabled);
        await selectable[0].trigger('click');
        await flush();

        await wrapper.findAll('button')
            .find((button) => button.text().includes('Connect'))
            .trigger('click');
        await flush();

        expect(updateBodies(coreClient)).toEqual([{ registryId: 'registry-1' }]);
    });
});
