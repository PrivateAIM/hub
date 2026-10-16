/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata, RemoteDispatcherOptions } from 'hubwire';
import { RemoteDispatcher } from 'hubwire';
import { MasterImageBuilderCommand, MasterImageBuilderTaskMessageBusRouting } from './constants';
import type { MasterImageBuilderExecutePayload } from './types';

export class MasterImageBuilderComponentDispatcher extends RemoteDispatcher {
    constructor(options: Omit<RemoteDispatcherOptions, 'routing'>) {
        super({ ...options, routing: MasterImageBuilderTaskMessageBusRouting });
    }

    async dispatchExecute(payload: MasterImageBuilderExecutePayload, metadata: ComponentMetadata = {}): Promise<void> {
        await this.dispatch(MasterImageBuilderCommand.EXECUTE, payload, metadata);
    }
}
