/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    isQueueRouterUsable, useLogger, useQueueRouter,
} from '@privateaim/server-kit';
import type { BuilderBasePayload } from '@privateaim/server-analysis-manager-kit';
import {
    BuilderEvent,
    BuilderEventQueueRouterRouting,
} from '@privateaim/server-analysis-manager-kit';
import type { Aggregator, QueueRouterHandlers } from '@privateaim/server-kit';
import { EnvironmentName, useEnv } from '../../../config';
import { handleAnalysisManagerBuilderBaseEvent } from './handler';

export function createAnalysisManagerBuilderHandlers() : QueueRouterHandlers<{
    [BuilderEvent.BUILDING]: BuilderBasePayload,
    [BuilderEvent.BUILT]: BuilderBasePayload,
    [BuilderEvent.CHECKING]: BuilderBasePayload,
    [BuilderEvent.CHECKED]: BuilderBasePayload,
    [BuilderEvent.PUSHING]: BuilderBasePayload,
    [BuilderEvent.PUSHED]: BuilderBasePayload,
    [BuilderEvent.NONE]: BuilderBasePayload,
}> {
    return {
        [BuilderEvent.BUILDING]: async (message) => {
            await handleAnalysisManagerBuilderBaseEvent(BuilderEvent.BUILDING, message.data);
        },
        [BuilderEvent.BUILT]: async (message) => {
            await handleAnalysisManagerBuilderBaseEvent(BuilderEvent.BUILT, message.data);
        },
        [BuilderEvent.CHECKING]: async (message) => {
            await handleAnalysisManagerBuilderBaseEvent(BuilderEvent.CHECKING, message.data);
        },
        [BuilderEvent.CHECKED]: async (message) => {
            await handleAnalysisManagerBuilderBaseEvent(BuilderEvent.CHECKED, message.data);
        },
        [BuilderEvent.PUSHING]: async (message) => {
            await handleAnalysisManagerBuilderBaseEvent(BuilderEvent.PUSHING, message.data);
        },
        [BuilderEvent.PUSHED]: async (message) => {
            await handleAnalysisManagerBuilderBaseEvent(BuilderEvent.PUSHED, message.data);
        },
        [BuilderEvent.NONE]: async (message) => {
            await handleAnalysisManagerBuilderBaseEvent(BuilderEvent.NONE, message.data);
        },
    };
}

export function createAnalysisManagerBuilderAggregator() : Aggregator {
    if (!isQueueRouterUsable() || useEnv('env') === EnvironmentName.TEST) {
        return {
            start() {
                useLogger().warn('Analysis worker builder component could not been initialized');
            },
        };
    }

    const queueRouter = useQueueRouter();

    return {
        start: () => queueRouter.consume(
            BuilderEventQueueRouterRouting,
            createAnalysisManagerBuilderHandlers(),
        ),
    };
}
