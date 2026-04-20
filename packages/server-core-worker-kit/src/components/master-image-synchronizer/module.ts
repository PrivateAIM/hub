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
    MasterImageSynchronizerCommand,
    MasterImageSynchronizerTaskMessageBusRouting,
} from './constants';
import type { MasterImageSynchronizerEventMap, MasterImageSynchronizerExecutePayload } from './types';

export class MasterImageSynchronizerComponentCaller extends MessageBusDispatchComponentCaller<MasterImageSynchronizerEventMap> {
    constructor(options: Partial<MessageBusDispatchComponentCallerOptions> = {}) {
        super({ ...options, routing: MasterImageSynchronizerTaskMessageBusRouting });
    }

    async callExecute(payload: MasterImageSynchronizerExecutePayload, metadata: ComponentMetadata = {}) {
        return this.call(MasterImageSynchronizerCommand.EXECUTE, payload, metadata);
    }
}
