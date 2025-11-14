/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata } from '@privateaim/server-kit';
import {
    QueueDispatchComponentCaller,
} from '@privateaim/server-kit';
import {
    BucketCommand,
    BucketTaskQueueRouterRouting,
} from './constants';
import type { BucketCreateCommandPayload, BucketDeleteCommandPayload } from './handlers';

export class BucketComponentCaller extends QueueDispatchComponentCaller {
    constructor() {
        super({
            queue: BucketTaskQueueRouterRouting,
        });
    }

    async callCreate(payload: BucketCreateCommandPayload, metadata: ComponentMetadata = {}) {
        return this.call(BucketCommand.CREATE, payload, metadata);
    }

    async callDelete(payload: BucketDeleteCommandPayload, metadata: ComponentMetadata = {}) {
        return this.call(BucketCommand.DELETE, payload, metadata);
    }
}
