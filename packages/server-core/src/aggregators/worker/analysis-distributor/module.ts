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
    QueueRouterComponentEmitter,
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

        if (isQueueRouterUsable()) {
            this.on('*', async (type, payload) => {
                const [data, metadata] = payload;
                const emitter = new QueueRouterComponentEmitter();
                await emitter.emit(type, data, metadata);
            });
        }
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
