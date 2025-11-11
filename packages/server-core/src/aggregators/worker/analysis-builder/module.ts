/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    AnalysisBuilderEvent,
} from '@privateaim/server-core-worker-kit';
import {
    BaseComponent,
} from '@privateaim/server-kit';
import {
    handleAnalysisBuilderEvent,
} from './handler';

export class AnalysisBuilderAggregator extends BaseComponent {
    constructor() {
        super();

        this.mount(AnalysisBuilderEvent.EXECUTION_STARTED, handleAnalysisBuilderEvent);
        this.mount(AnalysisBuilderEvent.EXECUTION_FAILED, handleAnalysisBuilderEvent);
        this.mount(AnalysisBuilderEvent.EXECUTION_FINISHED, handleAnalysisBuilderEvent);
    }

    async start() : Promise<void> {
        await this.initialize();
    }
}
