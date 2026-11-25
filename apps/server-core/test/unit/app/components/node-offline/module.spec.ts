/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterEach,
    describe,
    expect,
    it,
} from 'vitest';
import type { IComponent } from 'hubwire';
import type { INodeStatusService } from '../../../../../src/core/services/node-status/index.ts';
import { createNodeOfflineComponent } from '../../../../../src/app/components/node-offline/index.ts';

class FakeNodeStatusService implements Pick<INodeStatusService, 'markStaleNodesOffline'> {
    calls = 0;

    result: string[] | Error = [];

    async markStaleNodesOffline(): Promise<string[]> {
        this.calls++;

        if (Error.isError(this.result)) {
            throw this.result;
        }

        return this.result;
    }
}

describe('createNodeOfflineComponent', () => {
    let component: IComponent | undefined;

    afterEach(async () => {
        // stop() unschedules the cron task, which would otherwise keep the worker alive.
        await component?.stop();
        component = undefined;
    });

    it('should mark stale nodes offline once at start', async () => {
        const service = new FakeNodeStatusService();

        service.result = ['n1'];
        component = createNodeOfflineComponent({ service });

        await component.start();

        expect(service.calls).toBe(1);
        expect(component.status().lastSuccessAt).toBeTypeOf('number');
    });

    it('should not report success when the pass fails', async () => {
        const service = new FakeNodeStatusService();

        service.result = new Error('boom');
        component = createNodeOfflineComponent({ service });

        await component.start();

        expect(service.calls).toBe(1);
        expect(component.status().lastSuccessAt).toBeUndefined();
        expect(component.status().lastErrorAt).toBeTypeOf('number');
    });
});
