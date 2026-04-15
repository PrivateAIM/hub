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
import type { DataSource } from 'typeorm';
import {
    handleAnalysisBuilderEvent,
} from './handler.ts';

export class AnalysisBuilderAggregator extends BaseComponent<AnalysisBuilderEventMap> {
    constructor(ctx: { dataSource: DataSource }) {
        super();

        const handler = (value, context) => handleAnalysisBuilderEvent(value, context, ctx.dataSource);

        this.mount(AnalysisBuilderEvent.EXECUTION_PROGRESS, handler);
        this.mount(AnalysisBuilderEvent.EXECUTION_STARTED, handler);
        this.mount(AnalysisBuilderEvent.EXECUTION_FAILED, handler);
        this.mount(AnalysisBuilderEvent.EXECUTION_FINISHED, handler);

        this.mount(AnalysisBuilderEvent.CHECK_FAILED, handler);
        this.mount(AnalysisBuilderEvent.CHECK_FINISHED, handler);
    }

    async start() : Promise<void> {
        await this.initialize();
    }
}
