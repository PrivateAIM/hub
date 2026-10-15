/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata, MessageBusDispatchComponentCallerOptions } from 'ergos';
import { MessageBusDispatchComponentCaller } from 'ergos';
import { MasterImageBuilderCommand, MasterImageBuilderTaskMessageBusRouting } from './constants';
import type { MasterImageBuilderExecutePayload } from './types';

export class MasterImageBuilderComponentCaller extends MessageBusDispatchComponentCaller {
    constructor(options: Partial<MessageBusDispatchComponentCallerOptions> = {}) {
        super({ ...options, routing: MasterImageBuilderTaskMessageBusRouting });
    }

    async callExecute(payload: MasterImageBuilderExecutePayload, metadata: ComponentMetadata = {}) {
        return this.call(MasterImageBuilderCommand.EXECUTE, payload, metadata);
    }
}
