/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RemoteDispatcherOptions } from 'hubwire';
import { RemoteDispatcher } from 'hubwire';
import { BucketFileEventMessageBusRouting } from '../constants';

/**
 * Publishes bucket-file events (`BucketFileEvent`) onto the event routing.
 * Commands go through `BucketFileTaskDispatcher`.
 */
export class BucketFileEventDispatcher extends RemoteDispatcher {
    constructor(options: Omit<RemoteDispatcherOptions, 'routing'>) {
        super({ ...options, routing: BucketFileEventMessageBusRouting });
    }
}
