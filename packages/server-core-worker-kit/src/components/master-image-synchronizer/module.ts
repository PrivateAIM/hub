/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata, QueueDispatchComponentCallerOptions } from '@privateaim/server-kit';
import {
    QueueDispatchComponentCaller,
} from '@privateaim/server-kit';
import {
    MasterImageSynchronizerCommand,
    MasterImageSynchronizerTaskMessageBusRouting,
} from './constants';
import type { MasterImageSynchronizerEventMap, MasterImageSynchronizerExecutePayload } from './types';

export class MasterImageSynchronizerComponentCaller extends QueueDispatchComponentCaller<MasterImageSynchronizerEventMap> {
    constructor(options: Partial<QueueDispatchComponentCallerOptions> = {}) {
        super({ ...options, queue: MasterImageSynchronizerTaskMessageBusRouting });
    }

    async callExecute(payload: MasterImageSynchronizerExecutePayload, metadata: ComponentMetadata = {}) {
        return this.call(MasterImageSynchronizerCommand.EXECUTE, payload, metadata);
    }
}
