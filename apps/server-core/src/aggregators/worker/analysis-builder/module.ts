/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisBuilderEventMap } from '@privateaim/server-core-worker-kit';
import {
    AnalysisBuilderEvent,
} from '@privateaim/server-core-worker-kit';
import {
    BaseComponent,
} from '@privateaim/server-kit';
import {
    handleAnalysisBuilderEvent,
} from './handler.ts';

export class AnalysisBuilderAggregator extends BaseComponent<AnalysisBuilderEventMap> {
    constructor() {
        super();

        this.mount(AnalysisBuilderEvent.EXECUTION_PROGRESS, handleAnalysisBuilderEvent);
        this.mount(AnalysisBuilderEvent.EXECUTION_STARTED, handleAnalysisBuilderEvent);
        this.mount(AnalysisBuilderEvent.EXECUTION_FAILED, handleAnalysisBuilderEvent);
        this.mount(AnalysisBuilderEvent.EXECUTION_FINISHED, handleAnalysisBuilderEvent);

        this.mount(AnalysisBuilderEvent.CHECK_FAILED, handleAnalysisBuilderEvent);
        this.mount(AnalysisBuilderEvent.CHECK_FINISHED, handleAnalysisBuilderEvent);
    }

    async start() : Promise<void> {
        await this.initialize();
    }
}
