/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/kit';
import {
    AnalysisDistributorEvent,
    AnalysisDistributorEventQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import {
    BaseComponent,
    isQueueRouterUsable,
    useLogger,
    useQueueRouter,
} from '@privateaim/server-kit';
import { useEnv } from '../../../config';
import {
    handleAnalysisDistributorEvent,
} from './handler';

export class AnalysisDistributorAggregator extends BaseComponent {
    constructor() {
        super();

        this.mount(AnalysisDistributorEvent.EXECUTION_STARTED, handleAnalysisDistributorEvent);
        this.mount(AnalysisDistributorEvent.EXECUTION_FAILED, handleAnalysisDistributorEvent);
        this.mount(AnalysisDistributorEvent.EXECUTION_FINISHED, handleAnalysisDistributorEvent);
    }

    async start() : Promise<void> {
        if (!isQueueRouterUsable()) {
            useLogger().warn('Analysis distributor aggregator can not consume events.');
            return;
        }

        if (useEnv('env') === EnvironmentName.TEST) {
            useLogger().warn('Analysis distributor aggregator is disabled in test environment.');
            return;
        }

        await this.initialize();

        const queueRouter = useQueueRouter();

        await queueRouter.consumeAny(
            AnalysisDistributorEventQueueRouterRouting,
            async (
                payload,
            ) => this.handle(
                payload.type,
                payload.data,
                payload.metadata,
            ),
        );
    }
}
