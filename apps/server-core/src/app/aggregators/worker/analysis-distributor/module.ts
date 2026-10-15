/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AnalysisDistributorEventMap } from '@privateaim/server-core-worker-kit';
import { AnalysisDistributorEvent } from '@privateaim/server-core-worker-kit';
import { BaseComponent } from '@privateaim/server-kit';
import type { AnalysisDistributorAggregatorContext } from './types.ts';

export class AnalysisDistributorAggregator extends BaseComponent<AnalysisDistributorEventMap> {
    constructor(ctx: AnalysisDistributorAggregatorContext) {
        super();

        const handler = async (value, context) => {
            await ctx.distributor.applyEvent(context.key, value);
        };

        this.mount(AnalysisDistributorEvent.EXECUTION_STARTED, handler);
        this.mount(AnalysisDistributorEvent.EXECUTION_PROGRESS, handler);
        this.mount(AnalysisDistributorEvent.EXECUTION_FAILED, handler);
        this.mount(AnalysisDistributorEvent.EXECUTION_FINISHED, handler);

        this.mount(AnalysisDistributorEvent.CHECK_FAILED, handler);
        this.mount(AnalysisDistributorEvent.CHECK_FINISHED, handler);
    }

    async start() : Promise<void> {
        await this.initialize();
    }
}
