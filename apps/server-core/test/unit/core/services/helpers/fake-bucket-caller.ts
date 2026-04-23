/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IBucketCaller } from '../../../../../src/core/services/analysis-storage-manager/types.ts';

type BucketCallerCall = {
    method: 'callCreate' | 'callDelete';
    data: Record<string, any>;
    meta?: { correlationId?: string };
};

export class FakeBucketCaller implements IBucketCaller {
    private calls: BucketCallerCall[] = [];

    async callCreate(data: { name: string; realm_id: string }, meta?: { correlationId?: string }): Promise<void> {
        this.calls.push({
            method: 'callCreate', 
            data, 
            meta, 
        });
    }

    async callDelete(data: { id: string }, meta?: { correlationId?: string }): Promise<void> {
        this.calls.push({
            method: 'callDelete', 
            data, 
            meta, 
        });
    }

    getCalls(): BucketCallerCall[] {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }

    getCallsFor(method: 'callCreate' | 'callDelete'): BucketCallerCall[] {
        return this.calls.filter((c) => c.method === method);
    }

    clear(): void {
        this.calls = [];
    }
}
