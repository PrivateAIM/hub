/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    IMasterImageBuilderCaller,
} from '../../../../../src/core/entities/master-image/types.ts';

export class FakeMasterImageBuilderCaller implements IMasterImageBuilderCaller {
    private calls: Array<{ id: string }> = [];

    async callExecute(data: { id: string }): Promise<void> {
        this.calls.push(data);
    }

    getCalls(): Array<{ id: string }> {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }
}
