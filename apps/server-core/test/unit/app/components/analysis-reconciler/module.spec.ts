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
import { createAnalysisReconcilerComponent } from '../../../../../src/app/components/analysis-reconciler/index.ts';
import type { AnalysisReconcileResult, IAnalysisReconciler } from '../../../../../src/core/services/analysis-reconciler/index.ts';

class FakeReconciler implements IAnalysisReconciler {
    calls = 0;

    result: AnalysisReconcileResult | Error = { checked: 0, failed: 0 };

    async reconcile(): Promise<AnalysisReconcileResult> {
        this.calls++;
        if (this.result instanceof Error) {
            throw this.result;
        }

        return this.result;
    }
}

describe('createAnalysisReconcilerComponent', () => {
    let component: IComponent | undefined;

    afterEach(async () => {
        // stop() unschedules the cron task, which would otherwise keep the
        // worker alive.
        await component?.stop();
        component = undefined;
    });

    it('should reconcile once at start', async () => {
        const reconciler = new FakeReconciler();
        component = createAnalysisReconcilerComponent({ reconciler });

        await component.start();

        expect(reconciler.calls).toBe(1);
        expect(component.status().lastSuccessAt).toBeTypeOf('number');
        expect(component.status().runningSince).toBeUndefined();
    });

    it('should not report success when a check failed', async () => {
        const reconciler = new FakeReconciler();
        reconciler.result = { checked: 1, failed: 1 };
        component = createAnalysisReconcilerComponent({ reconciler });

        await component.start();

        expect(component.status().lastSuccessAt).toBeUndefined();
    });

    it('should not reject start when the pass itself fails', async () => {
        const reconciler = new FakeReconciler();
        reconciler.result = new Error('database down');
        component = createAnalysisReconcilerComponent({ reconciler });

        await expect(component.start()).resolves.toBeUndefined();
        expect(component.status().lastSuccessAt).toBeUndefined();
    });
});
