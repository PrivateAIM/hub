/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata, RemoteDispatcherOptions } from 'hubwire';
import { RemoteDispatcher } from 'hubwire';
import {
    BucketCommand,
    BucketTaskMessageBusRouting,
} from './constants';
import type { BucketClearCommandPayload, BucketCreateCommandPayload, BucketDeleteCommandPayload } from './handlers';

export class BucketComponentDispatcher extends RemoteDispatcher {
    constructor(options: Omit<RemoteDispatcherOptions, 'routing'>) {
        super({ ...options, routing: BucketTaskMessageBusRouting });
    }

    async dispatchCreate(payload: BucketCreateCommandPayload, metadata: ComponentMetadata = {}): Promise<void> {
        await this.dispatch(BucketCommand.CREATE, payload, metadata);
    }

    async dispatchDelete(payload: BucketDeleteCommandPayload, metadata: ComponentMetadata = {}): Promise<void> {
        await this.dispatch(BucketCommand.DELETE, payload, metadata);
    }

    async dispatchClear(payload: BucketClearCommandPayload, metadata: ComponentMetadata = {}): Promise<void> {
        await this.dispatch(BucketCommand.CLEAR, payload, metadata);
    }
}
