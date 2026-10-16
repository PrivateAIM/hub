/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata, DispatchCallerOptions } from 'synergos';
import { DispatchCaller } from 'synergos';
import {
    BucketFileCommand,
    BucketFileTaskMessageBusRouting,
} from '../constants';
import type { BucketFileCreateCommandPayload, BucketFileDeleteCommandPayload } from '../handlers';

export class BucketFileTaskCaller extends DispatchCaller {
    constructor(options: Omit<DispatchCallerOptions, 'routing'>) {
        super({ ...options, routing: BucketFileTaskMessageBusRouting });
    }

    async callCreate(payload: BucketFileCreateCommandPayload, metadata: ComponentMetadata = {}) {
        return this.call(BucketFileCommand.CREATE, payload, metadata);
    }

    async callDelete(payload: BucketFileDeleteCommandPayload, metadata: ComponentMetadata = {}) {
        return this.call(BucketFileCommand.DELETE, payload, metadata);
    }
}
