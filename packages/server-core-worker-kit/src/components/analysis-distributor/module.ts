/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata, RemoteDispatcherOptions } from 'hubwire';
import { RemoteDispatcher } from 'hubwire';
import { AnalysisDistributorCommand, AnalysisDistributorTaskMessageBusRouting } from './constants';
import type {
    AnalysisDistributorCheckPayload,
    AnalysisDistributorEventMap,
    AnalysisDistributorExecutePayload,
} from './types';

export class AnalysisDistributorComponentDispatcher extends RemoteDispatcher<AnalysisDistributorEventMap> {
    constructor(options: Omit<RemoteDispatcherOptions, 'routing'>) {
        super({ ...options, routing: AnalysisDistributorTaskMessageBusRouting });
    }

    async dispatchExecute(payload: AnalysisDistributorExecutePayload, metadata: ComponentMetadata = {}): Promise<void> {
        await this.dispatch(AnalysisDistributorCommand.EXECUTE, payload, metadata);
    }

    async dispatchCheck(payload: AnalysisDistributorCheckPayload, metadata: ComponentMetadata = {}): Promise<void> {
        await this.dispatch(AnalysisDistributorCommand.CHECK, payload, metadata);
    }
}
