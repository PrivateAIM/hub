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
import { AnalysisDistributorCommand, AnalysisDistributorTaskQueueRouterRouting } from './constants';
import type {
    AnalysisDistributorCheckPayload,
    AnalysisDistributorEventMap,
    AnalysisDistributorExecutePayload,
} from './types';

export class AnalysisDistributorComponentCaller extends QueueDispatchComponentCaller<AnalysisDistributorEventMap> {
    constructor() {
        super({
            queue: AnalysisDistributorTaskQueueRouterRouting,
        });
    }

    async callExecute(payload: AnalysisDistributorExecutePayload, metadata: ComponentMetadata = {}) {
        return this.call(AnalysisDistributorCommand.EXECUTE, payload, metadata);
    }

    async callCheck(payload: AnalysisDistributorCheckPayload, metadata: ComponentMetadata = {}) {
        return this.call(AnalysisDistributorCommand.CHECK, payload, metadata);
    }
}
