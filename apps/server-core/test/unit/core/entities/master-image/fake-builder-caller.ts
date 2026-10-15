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

    failWith: Error | undefined;

    /**
     * Runs before `failWith` is thrown — e.g. a worker event that arrives
     * although the publish reported a failure.
     */
    onExecute: (() => Promise<void>) | undefined;

    async callExecute(data: { id: string }): Promise<void> {
        this.calls.push(data);

        await this.onExecute?.();

        if (this.failWith) {
            throw this.failWith;
        }
    }

    getCalls(): Array<{ id: string }> {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }
}
