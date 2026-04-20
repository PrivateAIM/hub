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
import { AnalysisBuilderCommand, AnalysisBuilderTaskMessageBusRouting } from './constants';
import type { AnalysisBuilderBasePayload, AnalysisBuilderEventMap, AnalysisBuilderExecutePayload } from './types';

export class AnalysisBuilderComponentCaller extends MessageBusDispatchComponentCaller<AnalysisBuilderEventMap> {
    constructor(options: Partial<MessageBusDispatchComponentCallerOptions> = {}) {
        super({ ...options, routing: AnalysisBuilderTaskMessageBusRouting });
    }

    async callExecute(payload: AnalysisBuilderExecutePayload, metadata: ComponentMetadata = {}) {
        return this.call(AnalysisBuilderCommand.EXECUTE, payload, metadata);
    }

    async callCheck(payload: AnalysisBuilderBasePayload, metadata: ComponentMetadata = {}) {
        return this.call(AnalysisBuilderCommand.CHECK, payload, metadata);
    }
}
