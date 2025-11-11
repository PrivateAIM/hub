/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EnvironmentName } from '@privateaim/kit';
import {
    AnalysisBuilderEvent,
    AnalysisBuilderEventQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import {
    BaseComponent,
    isQueueRouterUsable,
    useLogger,
    useQueueRouter,
} from '@privateaim/server-kit';
import { useEnv } from '../../../config';
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
        if (!isQueueRouterUsable()) {
            useLogger().warn('Analysis builder aggregator can not consume events.');
            return;
        }

        if (useEnv('env') === EnvironmentName.TEST) {
            useLogger().warn('Analysis builder aggregator is disabled in test environment.');
            return;
        }

        await this.initialize();

        const queueRouter = useQueueRouter();

        await queueRouter.consumeAny(
            AnalysisBuilderEventQueueRouterRouting,
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
