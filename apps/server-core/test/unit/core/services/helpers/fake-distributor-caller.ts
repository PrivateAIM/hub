/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IAnalysisDistributorCaller } from '../../../../../src/core/services/analysis-distributor/types.ts';

type DistributorCallerCall = {
    method: 'callExecute' | 'callCheck';
    data: { id: string };
};

export class FakeAnalysisDistributorCaller implements IAnalysisDistributorCaller {
    private calls: DistributorCallerCall[] = [];

    async callExecute(data: { id: string }): Promise<void> {
        this.calls.push({ method: 'callExecute', data });
    }

    async callCheck(data: { id: string }): Promise<void> {
        this.calls.push({ method: 'callCheck', data });
    }

    getCalls(): DistributorCallerCall[] {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }

    getCallsFor(method: 'callExecute' | 'callCheck'): DistributorCallerCall[] {
        return this.calls.filter((c) => c.method === method);
    }

    clear(): void {
        this.calls = [];
    }
}
