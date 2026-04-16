/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis } from '@privateaim/core-kit';
import type {
    IAnalysisStorageManager,
} from '../../../../../../../src/adapters/database/subscribers/analysis/types.ts';

export type StorageManagerCall = {
    method: 'check' | 'remove';
    input: string | Analysis;
};

export class FakeStorageManager implements IAnalysisStorageManager {
    private calls: StorageManagerCall[] = [];

    async check(input: string | Analysis): Promise<Analysis> {
        this.calls.push({ method: 'check', input });
        return (typeof input === 'string' ? { id: input } : input) as Analysis;
    }

    async remove(input: string | Analysis): Promise<Analysis> {
        this.calls.push({ method: 'remove', input });
        return (typeof input === 'string' ? { id: input } : input) as Analysis;
    }

    getCalls(): StorageManagerCall[] {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }

    getCallsFor(method: 'check' | 'remove'): StorageManagerCall[] {
        return this.calls.filter((c) => c.method === method);
    }

    clear(): void {
        this.calls = [];
    }
}
