/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata, RemoteDispatcherOptions } from 'hubwire';
import { RemoteDispatcher } from 'hubwire';
import {
    BucketFileCommand,
    BucketFileEventMessageBusRouting,
} from '../constants';
import type { BucketFileCreateCommandPayload, BucketFileDeleteCommandPayload } from '../handlers';

export class BucketFileEventDispatcher extends RemoteDispatcher {
    constructor(options: Omit<RemoteDispatcherOptions, 'routing'>) {
        super({ ...options, routing: BucketFileEventMessageBusRouting });
    }

    async dispatchCreate(payload: BucketFileCreateCommandPayload, metadata: ComponentMetadata = {}): Promise<void> {
        await this.dispatch(BucketFileCommand.CREATE, payload, metadata);
    }

    async dispatchDelete(payload: BucketFileDeleteCommandPayload, metadata: ComponentMetadata = {}): Promise<void> {
        await this.dispatch(BucketFileCommand.DELETE, payload, metadata);
    }
}
