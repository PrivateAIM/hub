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
import { AnalysisDistributorCommand, AnalysisDistributorTaskMessageBusRouting } from './constants';
import type {
    AnalysisDistributorCheckPayload,
    AnalysisDistributorEventMap,
    AnalysisDistributorExecutePayload,
} from './types';

export class AnalysisDistributorComponentCaller extends MessageBusDispatchComponentCaller<AnalysisDistributorEventMap> {
    constructor(options: Partial<MessageBusDispatchComponentCallerOptions> = {}) {
        super({ ...options, routing: AnalysisDistributorTaskMessageBusRouting });
    }

    async callExecute(payload: AnalysisDistributorExecutePayload, metadata: ComponentMetadata = {}) {
        return this.call(AnalysisDistributorCommand.EXECUTE, payload, metadata);
    }

    async callCheck(payload: AnalysisDistributorCheckPayload, metadata: ComponentMetadata = {}) {
        return this.call(AnalysisDistributorCommand.CHECK, payload, metadata);
    }
}
