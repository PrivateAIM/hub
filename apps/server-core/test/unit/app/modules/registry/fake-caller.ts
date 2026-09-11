/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IRegistryCaller } from '../../../../../src/core/harbor/types.ts';

type RecordedCall = {
    command: string;
    data: Record<string, any>;
    meta: Record<string, any>;
};

export class FakeRegistryComponentCaller implements IRegistryCaller {
    protected calls: RecordedCall[] = [];

    async call(command: string, data: Record<string, any>, meta: Record<string, any>): Promise<void> {
        this.calls.push({
            command, 
            data, 
            meta, 
        });
    }

    getCalls(): RecordedCall[] {
        return this.calls;
    }
}
