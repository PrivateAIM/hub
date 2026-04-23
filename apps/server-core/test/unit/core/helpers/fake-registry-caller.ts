/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IRegistryCaller } from '../../../../src/core/harbor/types.ts';

type CallRecord = {
    command: string;
    data: Record<string, any>;
    meta: Record<string, any>;
};

export class FakeRegistryCaller implements IRegistryCaller {
    private calls: CallRecord[] = [];

    async call(command: string, data: Record<string, any>, meta: Record<string, any>): Promise<void> {
        this.calls.push({
            command, 
            data, 
            meta, 
        });
    }

    getCalls(): CallRecord[] {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }
}
