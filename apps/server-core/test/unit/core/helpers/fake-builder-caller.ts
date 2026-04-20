/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IAnalysisBuilderCaller } from '../../../../src/core/services/analysis-builder/types.ts';

type BuilderCallerCall = {
    method: 'callExecute' | 'callCheck';
    data: { id: string };
};

export class FakeAnalysisBuilderCaller implements IAnalysisBuilderCaller {
    private calls: BuilderCallerCall[] = [];

    async callExecute(data: { id: string }): Promise<void> {
        this.calls.push({ method: 'callExecute', data });
    }

    async callCheck(data: { id: string }): Promise<void> {
        this.calls.push({ method: 'callCheck', data });
    }

    getCalls(): BuilderCallerCall[] {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }

    getCallsFor(method: 'callExecute' | 'callCheck'): BuilderCallerCall[] {
        return this.calls.filter((c) => c.method === method);
    }

    clear(): void {
        this.calls = [];
    }
}
