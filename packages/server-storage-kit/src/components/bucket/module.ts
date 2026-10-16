/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata, DispatchCallerOptions } from 'synergos';
import { DispatchCaller } from 'synergos';
import {
    BucketCommand,
    BucketTaskMessageBusRouting,
} from './constants';
import type { BucketClearCommandPayload, BucketCreateCommandPayload, BucketDeleteCommandPayload } from './handlers';

export class BucketComponentCaller extends DispatchCaller {
    constructor(options: Omit<DispatchCallerOptions, 'routing'>) {
        super({ ...options, routing: BucketTaskMessageBusRouting });
    }

    async callCreate(payload: BucketCreateCommandPayload, metadata: ComponentMetadata = {}) {
        return this.call(BucketCommand.CREATE, payload, metadata);
    }

    async callDelete(payload: BucketDeleteCommandPayload, metadata: ComponentMetadata = {}) {
        return this.call(BucketCommand.DELETE, payload, metadata);
    }

    async callClear(payload: BucketClearCommandPayload, metadata: ComponentMetadata = {}) {
        return this.call(BucketCommand.CLEAR, payload, metadata);
    }
}
