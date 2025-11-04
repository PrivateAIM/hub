/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    EnvironmentName, isQueueRouterUsable, useLogger,
    useQueueRouter,
} from '@privateaim/server-kit';
import type { AnalysisBuilderBasePayload } from '@privateaim/server-core-worker-kit';
import {
    AnalysisBuilderEvent,
    AnalysisBuilderEventQueueRouterRouting,
} from '@privateaim/server-core-worker-kit';
import type { Aggregator, QueueRouterHandlers } from '@privateaim/server-kit';
import { useEnv } from '../../../config';
import { handleAnalysisManagerBuilderBaseEvent } from './handler';

export function createAnalysisManagerBuilderHandlers() : QueueRouterHandlers<{
    [AnalysisBuilderEvent.EXECUTION_STARTED]: AnalysisBuilderBasePayload,
    [AnalysisBuilderEvent.EXECUTION_FINISHED]: AnalysisBuilderBasePayload,
    [AnalysisBuilderEvent.CHECK_STARTED]: AnalysisBuilderBasePayload,
    [AnalysisBuilderEvent.CHECK_FINISHED]: AnalysisBuilderBasePayload,
    [AnalysisBuilderEvent.PUSHING]: AnalysisBuilderBasePayload,
    [AnalysisBuilderEvent.PUSHED]: AnalysisBuilderBasePayload,
    [AnalysisBuilderEvent.NONE]: AnalysisBuilderBasePayload,
}> {
    return {
        [AnalysisBuilderEvent.EXECUTION_STARTED]: async (message) => {
            await handleAnalysisManagerBuilderBaseEvent(AnalysisBuilderEvent.EXECUTION_STARTED, message.data);
        },
        [AnalysisBuilderEvent.EXECUTION_FINISHED]: async (message) => {
            await handleAnalysisManagerBuilderBaseEvent(AnalysisBuilderEvent.EXECUTION_FINISHED, message.data);
        },
        [AnalysisBuilderEvent.CHECK_STARTED]: async (message) => {
            await handleAnalysisManagerBuilderBaseEvent(AnalysisBuilderEvent.CHECK_STARTED, message.data);
        },
        [AnalysisBuilderEvent.CHECK_FINISHED]: async (message) => {
            await handleAnalysisManagerBuilderBaseEvent(AnalysisBuilderEvent.CHECK_FINISHED, message.data);
        },
        [AnalysisBuilderEvent.PUSHING]: async (message) => {
            await handleAnalysisManagerBuilderBaseEvent(AnalysisBuilderEvent.PUSHING, message.data);
        },
        [AnalysisBuilderEvent.PUSHED]: async (message) => {
            await handleAnalysisManagerBuilderBaseEvent(AnalysisBuilderEvent.PUSHED, message.data);
        },
        [AnalysisBuilderEvent.NONE]: async (message) => {
            await handleAnalysisManagerBuilderBaseEvent(AnalysisBuilderEvent.NONE, message.data);
        },
    };
}

export function createAnalysisManagerBuilderAggregator() : Aggregator {
    if (!isQueueRouterUsable() || useEnv('env') === EnvironmentName.TEST) {
        return {
            start() {
                useLogger().debug('Analysis worker builder component could not been initialized');
            },
        };
    }

    const queueRouter = useQueueRouter();

    return {
        start: () => queueRouter.consume(
            AnalysisBuilderEventQueueRouterRouting,
            createAnalysisManagerBuilderHandlers(),
        ),
    };
}
