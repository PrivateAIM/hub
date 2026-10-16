/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata, RemoteDispatcherOptions } from 'hubwire';
import { RemoteDispatcher } from 'hubwire';
import { AnalysisBuilderCommand, AnalysisBuilderTaskMessageBusRouting } from './constants';
import type { AnalysisBuilderBasePayload, AnalysisBuilderEventMap, AnalysisBuilderExecutePayload } from './types';

export class AnalysisBuilderComponentDispatcher extends RemoteDispatcher<AnalysisBuilderEventMap> {
    constructor(options: Omit<RemoteDispatcherOptions, 'routing'>) {
        super({ ...options, routing: AnalysisBuilderTaskMessageBusRouting });
    }

    async dispatchExecute(payload: AnalysisBuilderExecutePayload, metadata: ComponentMetadata = {}): Promise<void> {
        await this.dispatch(AnalysisBuilderCommand.EXECUTE, payload, metadata);
    }

    async dispatchCheck(payload: AnalysisBuilderBasePayload, metadata: ComponentMetadata = {}): Promise<void> {
        await this.dispatch(AnalysisBuilderCommand.CHECK, payload, metadata);
    }
}
