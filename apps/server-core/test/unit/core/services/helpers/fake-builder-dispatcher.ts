/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IAnalysisBuilderDispatcher } from '../../../../../src/core/services/analysis-builder/types.ts';

type BuilderDispatcherCall = {
    method: 'dispatchExecute' | 'dispatchCheck';
    data: { id: string };
};

export class FakeAnalysisBuilderDispatcher implements IAnalysisBuilderDispatcher {
    private calls: BuilderDispatcherCall[] = [];

    async dispatchExecute(data: { id: string }): Promise<void> {
        this.calls.push({ method: 'dispatchExecute', data });
    }

    async dispatchCheck(data: { id: string }): Promise<void> {
        this.calls.push({ method: 'dispatchCheck', data });
    }

    getCalls(): BuilderDispatcherCall[] {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }

    getCallsFor(method: 'dispatchExecute' | 'dispatchCheck'): BuilderDispatcherCall[] {
        return this.calls.filter((c) => c.method === method);
    }

    clear(): void {
        this.calls = [];
    }
}
