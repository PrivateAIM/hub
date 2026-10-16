/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IAnalysisDistributorDispatcher } from '../../../../../src/core/services/analysis-distributor/types.ts';

type DistributorDispatcherCall = {
    method: 'dispatchExecute' | 'dispatchCheck';
    data: { id: string };
};

export class FakeAnalysisDistributorDispatcher implements IAnalysisDistributorDispatcher {
    private calls: DistributorDispatcherCall[] = [];

    async dispatchExecute(data: { id: string }): Promise<void> {
        this.calls.push({ method: 'dispatchExecute', data });
    }

    async dispatchCheck(data: { id: string }): Promise<void> {
        this.calls.push({ method: 'dispatchCheck', data });
    }

    getCalls(): DistributorDispatcherCall[] {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }

    getCallsFor(method: 'dispatchExecute' | 'dispatchCheck'): DistributorDispatcherCall[] {
        return this.calls.filter((c) => c.method === method);
    }

    clear(): void {
        this.calls = [];
    }
}
