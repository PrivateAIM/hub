/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ComponentMetadata } from '@privateaim/server-kit';
import {
    QueueDispatchComponentCaller,
} from '@privateaim/server-kit';
import { AnalysisBuilderCommand, AnalysisBuilderTaskQueueRouterRouting } from './constants';
import type { AnalysisBuilderBasePayload, AnalysisBuilderEventMap, AnalysisBuilderExecutePayload } from './types';

export class AnalysisBuilderComponentCaller extends QueueDispatchComponentCaller<AnalysisBuilderEventMap> {
    constructor() {
        super({
            queue: AnalysisBuilderTaskQueueRouterRouting,
        });
    }

    async callExecute(payload: AnalysisBuilderExecutePayload, metadata: ComponentMetadata = {}) {
        return this.call(AnalysisBuilderCommand.EXECUTE, payload, metadata);
    }

    async callCheck(payload: AnalysisBuilderBasePayload, metadata: ComponentMetadata = {}) {
        return this.call(AnalysisBuilderCommand.CHECK, payload, metadata);
    }
}
