/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { describe, expect, it } from 'vitest';
import type { NodeComponent } from '@privateaim/core-kit';
import { createFakeClient } from '../../src/testing';

const COMPONENT = {
    id: 'c1', 
    nodeId: 'n1', 
    name: 'storage', 
} as NodeComponent;

describe('node status reporting', () => {
    it('should PUT a status report to the node', async () => {
        const client = createFakeClient({ handlers: { 'PUT /nodes/:id/status': () => ({ data: [COMPONENT], meta: { total: 1 } }) } });
        const report = { components: [{ name: 'storage', status: 'ok' as const }] };

        const response = await client.node.reportStatus('n1', report);

        expect(response.data).toEqual([COMPONENT]);
        expect(client.requests[0]).toMatchObject({
            method: 'PUT', 
            params: { id: 'n1' }, 
            body: report, 
        });
    });

    it('should PUT a component report with the name URL-encoded once', async () => {
        const client = createFakeClient({ handlers: { 'PUT /nodes/:id/components/:name/status': () => ({ data: COMPONENT, meta: {} }) } });

        const response = await client.node.reportComponentStatus('n1', 'storage', { status: 'ok' });

        expect(response.data).toEqual(COMPONENT);
        expect(client.requests[0]).toMatchObject({
            method: 'PUT',
            params: { id: 'n1', name: 'storage' },
            body: { status: 'ok' },
        });

        await client.node.reportComponentStatus('n1', 'a b/c', { status: 'ok' });
        expect(client.requests[1].url).toContain('/components/a%20b%2Fc/status');
    });

    it('should query node components with the filter', async () => {
        const client = createFakeClient({ handlers: { 'GET /node-components': () => ({ data: [COMPONENT], meta: { total: 1 } }) } });

        const response = await client.nodeComponent.getMany({ filters: { nodeId: 'n1' } });

        expect(response.meta.total).toBe(1);
        expect(client.requests[0].url).toContain('node-components');
        expect(decodeURIComponent(client.requests[0].url)).toContain('nodeId');
    });
});
