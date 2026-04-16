/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    IAnalysisMetadataCaller,
} from '../../../../../../../src/adapters/database/subscribers/analysis/types.ts';

export type MetadataCallerCall = {
    command: string;
    data: Record<string, any>;
    meta: Record<string, any>;
};

export class FakeMetadataCaller implements IAnalysisMetadataCaller {
    private calls: MetadataCallerCall[] = [];

    async call(command: string, data: Record<string, any>, meta: Record<string, any>): Promise<void> {
        this.calls.push({
            command, 
            data, 
            meta, 
        });
    }

    getCalls(): MetadataCallerCall[] {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }

    getLastCall(): MetadataCallerCall | undefined {
        return this.calls[this.calls.length - 1];
    }

    clear(): void {
        this.calls = [];
    }
}
