/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IBucketCaller } from '../../../../../src/core/services/analysis-storage-manager/types.ts';

type BucketCallerCreateData = {
    name: string; 
    realmId: string; 
    refType?: string; 
    refId?: string 
};

type BucketCallerMethod = 'callCreate' | 'callDelete' | 'callClear';

type BucketCallerCall = {
    method: BucketCallerMethod;
    data: BucketCallerCreateData | { id: string };
};

export class FakeBucketCaller implements IBucketCaller {
    private calls: BucketCallerCall[] = [];

    async callCreate(data: BucketCallerCreateData): Promise<void> {
        this.calls.push({ method: 'callCreate', data });
    }

    async callDelete(data: { id: string }): Promise<void> {
        this.calls.push({ method: 'callDelete', data });
    }

    async callClear(data: { id: string }): Promise<void> {
        this.calls.push({ method: 'callClear', data });
    }

    getCalls(): BucketCallerCall[] {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }

    getCallsFor(method: BucketCallerMethod): BucketCallerCall[] {
        return this.calls.filter((c) => c.method === method);
    }

    clear(): void {
        this.calls = [];
    }
}
