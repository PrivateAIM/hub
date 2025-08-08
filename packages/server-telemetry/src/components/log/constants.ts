/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { QueueRouterRoutingType } from '@privateaim/server-kit';

export enum LogEvent {
    STARTING = 'starting',
    STARTED = 'started',
    FINISHED = 'finished',
    FAILED = 'failed',
}

export enum LogCommand {
    WRITE = 'write',
}

export const LogEventQueueRouterRouting = {
    type: QueueRouterRoutingType.PUB_SUB,
    key: 'telemetryLogEvents',
};

export const LogTaskQueueRouterRouting = {
    type: QueueRouterRoutingType.WORK,
    key: 'telemetryLogTasks',
};
