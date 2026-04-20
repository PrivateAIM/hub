/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata, MessageBusDispatchComponentCallerOptions } from '@privateaim/server-kit';
import {
    MessageBusDispatchComponentCaller,
} from '@privateaim/server-kit';
import {
    BucketCommand,
    BucketTaskMessageBusRouting,
} from './constants';
import type { BucketCreateCommandPayload, BucketDeleteCommandPayload } from './handlers';

export class BucketComponentCaller extends MessageBusDispatchComponentCaller {
    constructor(options: Partial<MessageBusDispatchComponentCallerOptions> = {}) {
        super({ ...options, routing: BucketTaskMessageBusRouting });
    }

    async callCreate(payload: BucketCreateCommandPayload, metadata: ComponentMetadata = {}) {
        return this.call(BucketCommand.CREATE, payload, metadata);
    }

    async callDelete(payload: BucketDeleteCommandPayload, metadata: ComponentMetadata = {}) {
        return this.call(BucketCommand.DELETE, payload, metadata);
    }
}
