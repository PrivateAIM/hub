/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    IMasterImageSynchronizerDispatcher,
} from '../../../../../src/core/entities/master-image/types.ts';

export class FakeMasterImageSynchronizerDispatcher implements IMasterImageSynchronizerDispatcher {
    private calls: Array<{
        owner: string;
        repository: string;
        branch: string
    }> = [];

    async dispatchExecute(data: {
        owner: string;
        repository: string;
        branch: string
    }): Promise<void> {
        this.calls.push(data);
    }

    getCalls(): Array<{
        owner: string;
        repository: string;
        branch: string
    }> {
        return [...this.calls];
    }

    getCallCount(): number {
        return this.calls.length;
    }
}
