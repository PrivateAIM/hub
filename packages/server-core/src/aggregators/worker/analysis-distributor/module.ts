/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisDistributorEventMap } from '@privateaim/server-core-worker-kit';
import { AnalysisDistributorEvent } from '@privateaim/server-core-worker-kit';
import { BaseComponent } from '@privateaim/server-kit';
import { handleAnalysisDistributorEvent } from './handler';

export class AnalysisDistributorAggregator extends BaseComponent<AnalysisDistributorEventMap> {
    constructor() {
        super();

        this.mount(AnalysisDistributorEvent.EXECUTION_STARTED, handleAnalysisDistributorEvent);
        this.mount(AnalysisDistributorEvent.EXECUTION_PROGRESS, handleAnalysisDistributorEvent);
        this.mount(AnalysisDistributorEvent.EXECUTION_FAILED, handleAnalysisDistributorEvent);
        this.mount(AnalysisDistributorEvent.EXECUTION_FINISHED, handleAnalysisDistributorEvent);

        this.mount(AnalysisDistributorEvent.CHECK_FAILED, handleAnalysisDistributorEvent);
        this.mount(AnalysisDistributorEvent.CHECK_FINISHED, handleAnalysisDistributorEvent);
    }

    async start() : Promise<void> {
        await this.initialize();
    }
}
