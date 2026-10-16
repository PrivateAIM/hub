/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IBucketDispatcher } from '../../../../../src/core/services/analysis-storage-manager/types.ts';

type BucketDispatcherCreateData = {
    name: string; 
    realmId: string; 
    refType?: string; 
    refId?: string 
};

type BucketDispatcherMethod = 'dispatchCreate' | 'dispatchDelete' | 'dispatchClear';

type BucketDispatcherCall = {
    method: BucketDispatcherMethod;
    data: BucketDispatcherCreateData | { id: string };
};

export class FakeBucketDispatcher implements IBucketDispatcher {
    private calls: BucketDispatcherCall[] = [];

    async dispatchCreate(data: BucketDispatcherCreateData): Promise<void> {
        this.calls.push({ method: 'dispatchCreate', data });
    }

    async dispatchDelete(data: { id: string }): Promise<void> {
        this.calls.push({ method: 'dispatchDelete', data });
    }

    async dispatchClear(data: { id: string }): Promise<void> {
        this.calls.push({ method: 'dispatchClear', data });
    }

    getCalls(): BucketDispatcherCall[] {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }

    getCallsFor(method: BucketDispatcherMethod): BucketDispatcherCall[] {
        return this.calls.filter((c) => c.method === method);
    }

    clear(): void {
        this.calls = [];
    }
}
