/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata, RemoteDispatcherOptions } from 'hubwire';
import { RemoteDispatcher } from 'hubwire';
import {
    MasterImageSynchronizerCommand,
    MasterImageSynchronizerTaskMessageBusRouting,
} from './constants';
import type { MasterImageSynchronizerEventMap, MasterImageSynchronizerExecutePayload } from './types';

export class MasterImageSynchronizerComponentDispatcher extends RemoteDispatcher<MasterImageSynchronizerEventMap> {
    constructor(options: Omit<RemoteDispatcherOptions, 'routing'>) {
        super({ ...options, routing: MasterImageSynchronizerTaskMessageBusRouting });
    }

    async dispatchExecute(payload: MasterImageSynchronizerExecutePayload, metadata: ComponentMetadata = {}): Promise<void> {
        await this.dispatch(MasterImageSynchronizerCommand.EXECUTE, payload, metadata);
    }
}
