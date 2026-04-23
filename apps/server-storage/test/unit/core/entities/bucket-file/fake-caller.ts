/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IBucketFileCaller } from '../../../../../src/core/entities/bucket-file/types.ts';

export class FakeBucketFileCaller implements IBucketFileCaller {
    private deleteCalls: string[] = [];

    async delete(id: string): Promise<void> {
        this.deleteCalls.push(id);
    }

    getDeleteCalls(): string[] {
        return [...this.deleteCalls];
    }
}
