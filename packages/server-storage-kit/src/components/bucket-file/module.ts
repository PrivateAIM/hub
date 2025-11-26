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
    BucketFileCommand,
    BucketFileTaskQueueRouterRouting,
} from './constants';
import type { BucketFileCreateCommandPayload, BucketFileDeleteCommandPayload } from './handlers';

export class BucketFileComponentCaller extends QueueDispatchComponentCaller {
    constructor() {
        super({
            queue: BucketFileTaskQueueRouterRouting,
        });
    }

    async callCreate(payload: BucketFileCreateCommandPayload, metadata: ComponentMetadata = {}) {
        return this.call(BucketFileCommand.CREATE, payload, metadata);
    }

    async callDelete(payload: BucketFileDeleteCommandPayload, metadata: ComponentMetadata = {}) {
        return this.call(BucketFileCommand.DELETE, payload, metadata);
    }
}
